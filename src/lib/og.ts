import satori from 'satori';
import { html } from 'satori-html';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import siteConfig from '@/config/site.config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface OGImageOptions {
  title: string;
  description?: string;
  type?: 'website' | 'article';
}

let fontCache: ArrayBuffer | null = null;
let wasmInitialized = false;

// Use fetch to grab the font from a CDN. 
// Cloudflare caches this heavily, bypassing the need for node:fs entirely.
async function loadFont(): Promise<ArrayBuffer> {
  if (!fontCache) {
    const response = await fetch(
      'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf'
    );
    fontCache = await response.arrayBuffer();
  }
  return fontCache;
}

// Note: We return Uint8Array here, which is standard for Edge APIs and works perfectly in Astro Responses
export async function generateOGImage(options: OGImageOptions): Promise<Uint8Array> {
  const { title, description, type = 'website' } = options;

  // loadFont is now async, so we await it
  const fontData = await loadFont();

  const truncatedDescription = description
    ? description.length > 120
      ? description.slice(0, 117) + '...'
      : description
    : '';

  const markup = html`
    <div style="height: 100%; width: 100%; display: flex; flex-direction: column; background: linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%); padding: 60px 80px; font-family: 'Inter'; position: relative;">
      <div style="display: flex; position: absolute; top: 0; left: 0; width: 8px; height: 100%; background: linear-gradient(180deg, #f97316 0%, #fb923c 50%, #f97316 100%);"></div>
      <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding-left: 20px;">
        <div style="display: flex; align-items: center;">
          <div style="display: flex; padding: 8px 16px; background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 9999px; color: #fb923c; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">${type === 'article' ? 'Article' : 'Page'}</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div style="display: flex; font-size: ${title.length > 50 ? '48px' : '64px'}; font-weight: 700; color: #fafafa; line-height: 1.2; letter-spacing: -0.02em;">${title}</div>
          <div style="display: ${truncatedDescription ? 'flex' : 'none'}; font-size: 24px; color: #a1a1aa; line-height: 1.5; max-width: 800px;">${truncatedDescription}</div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 12px;">
              <span style="font-size: 24px; font-weight: 700; color: #18181b;">V</span>
            </div>
            <span style="font-size: 20px; font-weight: 600; color: #fafafa;">${siteConfig.name}</span>
          </div>
          <span style="font-size: 16px; color: #71717a;">${new URL(siteConfig.url).hostname}</span>
        </div>
      </div>
    </div>
  `;

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

  // ✅ Read the file directly from the hard drive (100% allowed now)
  if (!wasmInitialized) {
    try {
      const wasmPath = join(process.cwd(), 'node_modules', '@resvg/resvg-wasm', 'index_bg.wasm');
      const wasmBuffer = readFileSync(wasmPath);
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