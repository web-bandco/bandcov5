# bandcov5 (Brighton and Co, version 5)

Personal website of Harry B. Astro site built on the Velocity starter, deployed as a static site to Cloudflare Workers.

## Current work

The site is moving from Velocity 1.0.0 to Velocity 2.6.2 by a rebuild on branch `upgrade/velocity-2.6`.
Read `docs/upgrade-plan.md` before any work. It holds the decisions, the facts, the progress checklist and the full guide.

## Rules

- Write replies to Harry in ASD-STE100 (Simplified Technical English): short sentences, active voice, one instruction per sentence.
- Use plan mode for each page or phase. Wait for Harry's approval before you change files.
- Do not edit Velocity-owned files (`files.safe` in `velocity-manifest.json`). Use the project-owned files: `src/styles/theme.css`, `src/styles/brand.css`, `src/components/site/`, `src/views/`, `src/pages/`, `src/content/`, `src/config/`, `astro.config.mjs`.
- Keep the site fully static. Do not add a server adapter or Astro Actions.
- Keep Web3Forms and hCaptcha for the contact form.
- Use npm only. Do not add pnpm or yarn files.
- Prefer HTML and CSS. Add JavaScript only when HTML and CSS cannot do the job. Add a React island only when it is necessary.
- Do not add a package without a reason. Remove packages that nothing uses.
- Keep every page at WCAG AA or better. Keep the Velocity tests green: `npm run validate`.
- Keep all current URLs. A removed URL needs a redirect in `public/_redirects`.
- Commit after each page. Tick the step in `docs/upgrade-plan.md`.
- Cloudflare: ask Harry before any write action through the Cloudflare MCP server. Never put tokens or deploy hook URLs in Git.
- Do not change `bandco-shop/` (Sanity Studio) unless Harry asks.

## Commands

- `npm run dev`: development server
- `npm run build`: production build
- `npm run validate`: lint, type check, unit tests, build (Velocity 2.6)
- `npm run test:e2e`: browser and accessibility tests (after a build)

@AGENTS.md
