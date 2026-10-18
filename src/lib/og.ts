import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import siteConfig from '@/config/site.config';

export interface OGImageOptions {
  title: string;
  description?: string;
  type?: 'website' | 'article';
  /** Small label above the title, e.g. "Holiday Gallery" (defaults to Page/Article) */
  label?: string;
}

// B&Co brand teal (brand-400 / brand-500 / brand-600)
const BRAND = { light: '#00d3f2', main: '#00b8db', dark: '#0092b8' };

let fontCache: Buffer | null = null;
let logoCache: string | null = null;
let wasmInitialized = false;

// The font and logo are read from the project at build time (no network needed)
async function loadFont(): Promise<Buffer> {
  fontCache ??= await readFile(join(process.cwd(), 'public/fonts/inter-latin-400-normal.ttf'));
  return fontCache;
}

// satori-html escapes inserted text (e.g. "B&Co" -> "B&amp;Co") but satori draws text
// literally, so decode the entities back in the text nodes before rendering
const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decodeEntities = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) =>
    e[0] === '#'
      ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
      : NAMED[e.toLowerCase()]
  );

function decodeText<T>(node: T): T {
  if (typeof node === 'string') return decodeEntities(node) as T;
  if (Array.isArray(node)) return node.map(decodeText) as T;
  const props = (node as { props?: { children?: unknown } } | null)?.props;
  if (props && props.children !== undefined) props.children = decodeText(props.children);
  return node;
}

async function loadLogo(): Promise<string> {
  if (!logoCache) {
    const png = await readFile(join(process.cwd(), 'src/assets/branding/logomark-reduced.png'));
    logoCache = `data:image/png;base64,${png.toString('base64')}`;
  }
  return logoCache;
}

export async function generateOGImage(options: OGImageOptions): Promise<Uint8Array> {
  const { title, description, type = 'website', label = type === 'article' ? 'Article' : 'Page' } = options;

  const [fontData, logo] = await Promise.all([loadFont(), loadLogo()]);

  const truncatedDescription = description
    ? description.length > 120
      ? description.slice(0, 117) + '...'
      : description
    : '';

  const markup = decodeText(html`
    <div style="height: 100%; width: 100%; display: flex; flex-direction: column; background: linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%); padding: 60px 80px; font-family: 'Inter'; position: relative;">
      <div style="display: flex; position: absolute; top: 0; left: 0; width: 8px; height: 100%; background: linear-gradient(180deg, ${BRAND.main} 0%, ${BRAND.light} 50%, ${BRAND.dark} 100%);"></div>
      <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding-left: 20px;">
        <div style="display: flex; align-items: center;">
          <div style="display: flex; padding: 8px 16px; background: rgba(0, 184, 219, 0.1); border: 1px solid rgba(0, 184, 219, 0.3); border-radius: 9999px; color: ${BRAND.light}; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">${label}</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div style="display: flex; font-size: ${title.length > 50 ? '48px' : '64px'}; font-weight: 700; color: #fafafa; line-height: 1.2; letter-spacing: -0.02em;">${title}</div>
          <div style="display: ${truncatedDescription ? 'flex' : 'none'}; font-size: 24px; color: #a1a1aa; line-height: 1.5; max-width: 800px;">${truncatedDescription}</div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${logo}" style="width: 48px; height: 48px;" />
            <span style="font-size: 20px; font-weight: 600; color: #fafafa;">${siteConfig.name}</span>
          </div>
          <span style="font-size: 16px; color: #71717a;">${new URL(siteConfig.url).hostname}</span>
        </div>
      </div>
    </div>
  `);

  // Generate SVG with satori
  // @ts-expect-error satori-html VNode is compatible with satori
  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: fontData, weight: 400, style: 'normal' },
      { name: 'Inter', data: fontData, weight: 500, style: 'normal' },
      { name: 'Inter', data: fontData, weight: 600, style: 'normal' },
      { name: 'Inter', data: fontData, weight: 700, style: 'normal' },
    ],
  });

  // ✅ THE SILVER BULLET: Fetch the WebAssembly file directly from a CDN, bypassing the hard drive entirely
  if (!wasmInitialized) {
    try {
      const wasmResponse = await fetch('https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm');
      const wasmBuffer = await wasmResponse.arrayBuffer();
      await initWasm(wasmBuffer);
      wasmInitialized = true;
    } catch (e) {
      console.warn("Wasm initialization warning:", e);
    }
  }

  // Convert SVG to PNG using resvg-wasm
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });

  const pngData = resvg.render();

  return pngData.asPng(); // Returns Uint8Array (Standard for Edge)
}
