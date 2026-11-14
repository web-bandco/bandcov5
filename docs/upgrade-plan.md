<!--
  Handoff file for Claude Code in VSCode.
  Part 1 = facts, decisions and progress (keep this part up to date).
  Part 2 = the full guide, copied from the live document on 11 November 2026.
-->

# Part 1: Facts, decisions and progress

## How to use this file (for Claude Code)

1. Read `CLAUDE.md` first, then all of this file.
2. Do one phase at a time. Show a plan and wait for Harry's approval before you change files (plan mode).
3. After each step, tick it in "Progress" below and commit.
4. If a fact here is wrong, correct it here and tell Harry.

## Decisions (made by Harry, 9 to 11 November 2026)

| Topic | Decision |
| --- | --- |
| Method | Option B: a fresh Velocity 2.6.2 project on branch `upgrade/velocity-2.6`, then rebuild each page. |
| Velocity files | Never edit Velocity-owned files (the `files.safe` list in `velocity-manifest.json`, and `.velocity.json` hashes). Put changes only in files that Velocity gives to the project. |
| Build | Fully static. No server adapter. No Astro Actions (`src/actions/` removed). |
| Contact form | Keep Web3Forms with hCaptcha. Do not use the Velocity `ContactForm` or `NewsletterForm`. |
| Analytics | GA4 only, no Tag Manager. Consent mode `strict` (nothing loads before "Accept"). Only 2 consent categories: `necessary`, `analytics`. Increase consent `version`. |
| Design | Look largely the same. Keep the current colour system (teal brand scale, tokens in `src/styles/themes/default.css` on `master`). WCAG AA or better. |
| Home page | Keep the rotating text carousel and its pause button. Add reduced-motion support. Less script. |
| Photography | Keep the lightbox behaviour (full-size view, next and previous, swipe, Esc). Build it on the Velocity `Dialog`. Rows use the Velocity `Carousel`. |
| Pages | Keep all current pages and URLs. |
| Shop | Keep Sanity. `bandco-shop/` (Sanity Studio) stays in the repository, unchanged. |
| Package manager | npm only. Harry uses Windows (main) and a Mac. |
| Domain | Live: `brightonandco.co.uk`. A move to `bandco.uk` comes later, as a separate change after the upgrade. |
| Writing style | Harry wants replies in ASD-STE100 (Simplified Technical English). |

## Facts (checked 11 November 2026)

- `.velocity.json` on `master`: Velocity 1.0.0, made 2026-05-05. Target: Velocity 2.6.2 (released 2026-11-09).
- `master` (v5.5.3a) already uses Astro 7.0.3, Tailwind 4.3 and ESLint 10.
- 48 of the 156 Velocity 1.0.0 files on `master` were changed by Harry. Do not copy these files across. Rebuild their effect in project-owned files.
- Cloudflare: Worker `bandcov5`, Workers Builds, automatic builds on. `master` runs `npx wrangler deploy`. Other branches run `npx wrangler versions upload`. Preview URLs are on. Build caching is on (both triggers). Build command `npm run build`, root `/`.
- Cloudflare build variables: `PUBLIC_CONSENT_ENABLED=true`, `PUBLIC_GA_MEASUREMENT_ID` (set), `PUBLIC_PRIVACY_POLICY_URL=/about/privacy`. No `PUBLIC_GTM_ID`. No `NODE_VERSION`.
- Tool versions in Cloudflare builds: Node 24.22.2 (from `.nvmrc`), npm 10.9.2, Wrangler 4.158.0.
- `wrangler.bandco.toml` (added by the handoff pull request) has the same settings as the old `wrangler.toml`, plus `preview_urls = true`. Velocity owns `wrangler.toml` and replaces it (name `velocity`, folder `./dist/client`), so the Cloudflare deploy commands must use `--config wrangler.bandco.toml`.
- Claude Code reaches Cloudflare through `.mcp.json` (server `https://mcp.cloudflare.com/mcp`), with `workers-scripts.write` and `workers-ci.write` scopes. Ask Harry before any write.
- Velocity 2.6 `astro.config.mjs` picks an adapter from `integrations/deploy-target.mjs`. On Cloudflare it sees `WORKERS_CI` and loads `@astrojs/cloudflare`. Remove the adapter and cache lines for a static build.
- URLs need `trailingSlash: 'never'` and `build.format: 'file'` in `astro.config.mjs`.
- Sanity: project `63lsf8co`, dataset `shop-dataset1`, fetched at build time. Not yet known: whether a Sanity webhook calls a Cloudflare deploy hook.

## Progress

### Before Phase 1
- [ ] Merge the handoff pull request (this file, `CLAUDE.md`, `wrangler.bandco.toml`) into `master`.
- [ ] In Cloudflare, set the deploy command to `npx wrangler deploy --config wrangler.bandco.toml`, and the other-branch command to `npx wrangler versions upload --config wrangler.bandco.toml`. Push a small change to `master`. Check that the live site still deploys.
- [ ] Commit `.mcp.json` to `master`, if it is not committed yet.

### Phase 1: Prepare
- [ ] Node 24 on Windows and Mac
- [ ] Worktree `../bandcov5-old` on `master`
- [ ] Branch `upgrade/velocity-2.6`

### Phase 2: Fresh 2.6.2 project
- [ ] Scaffold, copy, `npm install`
- [ ] Static build: adapter and `src/actions/` removed
- [ ] `npm run build` and `npm run test` pass
- [ ] First preview build works

### Phase 3: Brand
- [ ] `src/styles/brand.css` and `theme.css`
- [ ] Logo and favicons
- [ ] `site.config.ts` and `nav.config.ts`
- [ ] Site header and footer
- [ ] `astro.config.mjs` URL settings

### Phase 4: Pages (tick the "Must keep" items in the page-by-page review)
- [ ] Policies: AI, Privacy, Terms
- [ ] 404
- [ ] About
- [ ] Blog index and posts
- [ ] Contact
- [ ] Photography, holiday galleries, holiday gallery
- [ ] Shop and product pages
- [ ] Home
- [ ] Search page on

### Phase 5: Analytics, consent and security
- [ ] GA4 strict consent, 2 categories, page-view check
- [ ] CSP allows Google, Web3Forms and hCaptcha only where used
- [ ] `_redirects` and `_headers`

### Phase 6: Test and go live
- [ ] `npm run validate`, `npm run test:e2e`, `npm run check:agent`
- [ ] Old and new sitemaps compared
- [ ] Preview checked on Windows, Mac and a phone, light and dark
- [ ] Pull request merged, live site checked

---

# Part 2: The guide

# bandcov5: Velocity 2.6 upgrade guide

Written 9 November 2026, updated 11 November 2026, for Harry. Live copy: https://claude.ai/artifact/NKEoJFtcHvzVot6nagrTQG

## Summary

Rebuild bandcov5 on a fresh Velocity 2.6.2 project (Option B), on a new branch in the same repository. Move each page across one at a time. Keep your brand colours, all pages and Web3Forms. Keep the site fully static on Cloudflare.

**Decisions made so far**

| Decision | Choice | Reason |
| --- | --- | --- |
| Upgrade method | Option B: fresh 2.6.2 project, rebuild pages | You never edit Velocity-owned files. Future upgrades become almost automatic. |
| Where | New branch `upgrade/velocity-2.6` in bandcov5 | Keeps history, Cloudflare setup and secrets. |
| Build type | Fully static, no adapter | No page needs a server. |
| Contact form | Keep Web3Forms | Fewer parts. Email delivery and spam protection included. |
| Design | Largely the same, current colour system | Accessibility, uniformity and simplicity. |
| Package manager | npm | You use npm on Windows and Mac. |

**Principles for every step**

1. **Do not edit Velocity-owned files.** Put your changes only in the files that Velocity gives to you (theme, site header and footer, views, pages, content, config).
2. **Less is more.** Remove each package, script and component that the site does not need.
3. **HTML and CSS first.** Use JavaScript only when HTML and CSS cannot do the job.
4. **Accessible by default.** Each page must pass the Velocity axe tests (WCAG 2 A and AA).
5. **One change at a time.** Commit after each page. Check the Cloudflare preview after each push.

**Phases**

1. Prepare (Node 24, Cloudflare previews, branch).
2. Make the fresh 2.6.2 project on the branch.
3. Move the brand (colours, fonts, logo, header, footer).
4. Move the pages, one at a time.
5. Analytics, consent and security (CSP).
6. Test, preview and go live.

The audits below give the reasons for each suggested change.

## Option A or Option B

Option B is the better choice for your site. Your view that Option A is "whack-a-mole" is correct. Our earlier report recommended Option A because it uses less effort at the start. Your priorities are simplicity, polish and few problems. For these priorities, Option B is better.

| Factor | Option A: upgrade in place | Option B: fresh 2.6.2, rebuild pages |
| --- | --- | --- |
| Start point | Your current files, with 48 conflicts and 6 replaced folders | A clean Velocity 2.6.2 project that builds and passes its tests |
| How you work | Merge old and new versions of each file by hand | Copy your content into clean, known structures |
| Velocity-owned files after the work | Many still changed by you | None changed by you |
| Next Velocity upgrade (2.7, 3.0) | Conflicts again | Almost automatic: the tool replaces only Velocity files |
| Old code that remains | Some (old scripts, `astro:page-load` code, unused packages) | Only what you choose to bring across |
| Chance to simplify | Low. You fix what breaks. | High. Each page is reviewed as you move it. |
| Risk | Hidden breaks in merged files | You can forget a feature or a URL. The checklists below prevent this. |
| Effort | Medium, but unpredictable | Medium to large, but predictable: one page at a time |
| Tests | Velocity tests can fail on old code | Velocity tests pass from day one. Each page must keep them green. |

**How Option B works in the same repository**

1. Make the branch `upgrade/velocity-2.6` from `master`.
2. Make a fresh 2.6.2 project with the CLI in a temporary folder. Copy it into the branch. The CLI writes a new `.velocity.json` with the correct file hashes for future upgrades.
3. Keep the old site open beside the new one. Use a Git worktree: `git worktree add ../bandcov5-old master`. VSCode can open both folders. You copy from the old folder to the new one.
4. Keep `bandco-shop/` (Sanity Studio) as it is. It is separate and the upgrade does not affect it.
5. When all pages pass, merge the branch into `master` with a pull request.

**Two controls stop features and URLs from getting lost**

1. A **feature checklist** for each page (see the page-by-page review).
2. A **URL check**. Before you go live, compare the old and new `sitemap-index.xml`. Each old URL must exist, or must have a redirect in `public/_redirects`.

## Simplicity and efficiency audit

Velocity 2.6 is simpler or more efficient than bandcov5 in 12 of 16 areas. The largest gains are: one component system instead of three, less JavaScript on each page, smaller source images, and tests. "High" priority means: do it during the rebuild.

| Area | bandcov5 now | Velocity 2.6 | Suggestion | Reason | Priority |
| --- | --- | --- | --- | --- | --- |
| Component systems | Three overlap: Velocity Astro, Velocity React (`.tsx) copies, and shadcn with radix-ui and embla | One Astro set with 41 UI parts, including Carousel, Sheet, Popover, Dialog, Spinner | Use Velocity components only. Remove shadcn, radix-ui`, `embla-carousel-*` and `components.json` | One system to learn and maintain. Less JavaScript. Uniform look. | High |
| Unused code | 4 shadcn parts are not used (card, progress, skeleton, tabs) | Not applicable | Do not bring them across | Dead code | High |
| Page navigation | `<ClientRouter /> (about 5.7 KB JS on each page) and custom fade | Native browser view transitions and hover prefetch (about 1.2 KB) | Use the Velocity method. Put your fade in CSS (::view-transition-old/new`) | Less JS. Works with the security policy. | High |
| React islands | 7 islands: 4 image carousels, product gallery, shop grid, toast | React only where needed | Carousels: Velocity `Carousel` (CSS scroll snap, no React). Toast: the inline status message you already have. Keep React only for the shop filters, or rewrite them in a short script | Less JS to download and run | High |
| Icons | `lucide-react` and `react-icons (only for the Vinted and eBay icons) | All Lucide icons by name in Astro | Use the Velocity Icon`. Put the Vinted and eBay logos in 2 small SVG files | Removes a large package for 2 icons | High |
| Source images | 165 MB in `src/assets` (75 files). 21 files are more than 3 MB. The largest is 10.8 MB | Not applicable | Resize the originals to 2560 px on the long side, JPEG quality 85, before you add them | Faster builds and Git. Visitors see no difference, because Astro already makes small versions | High |
| Fonts | `@fontsource` CSS imports (Manrope, Outfit) | Astro Fonts API, same fonts, with preload and size-matched fallbacks | Use the Velocity method | Less layout shift when the page loads | High (automatic) |
| Global CSS | `global.css is 1,123 lines. 526 lines differ from Velocity | Brand goes in theme.css and your theme file | Put colours in your theme file. Put page styles next to the page. Do not edit global.css` | Upgrades stay automatic | High |
| Security | Headers in `public/_headers`, no CSP | Hash-based CSP on every page | Use the Velocity CSP. Allow only Google Analytics, Web3Forms and hCaptcha where they are used | Blocks injected scripts | High |
| Tests | None | 97 unit and 51 browser tests, with axe accessibility checks | Keep them green after each page | Finds broken pages before visitors do | High |
| Click tracking | 37 `data-analytics-nav` links and a global listener with old Universal Analytics fields | Not included | Use GA4 enhanced measurement (page views, outbound clicks, scrolls). Keep 2 or 3 custom events only | Less code. GA4 already records most of this | Medium |
| Site search | Pagefind is installed but not used | `/search` page, built automatically | Turn it on | Useful for blog, shop and photos at no running cost | Medium |
| Header and footer | Velocity files changed: Header 820 lines, Footer 807 lines | `SiteHeader` and `SiteFooter (yours) wrap the Velocity parts | Set links and options through props and nav.config.ts`. Make your own part in `src/components/site/` only if props cannot do it | Upgrades stay automatic | Medium |
| Social images | Own code with `og-pages.ts` and `@resvg/resvg-wasm` | A themed image for every page | Use the Velocity method with your brand colours. Remove your own copy if it gives the same result | Less code to maintain | Medium |
| Package manager files | `package-lock.json` and `pnpm-workspace.yaml` and a `pnpm` field | Velocity uses pnpm, but npm works | Use npm only. Remove the pnpm files | One method, fewer mistakes | Low |
| Dark-mode favicon | Script with a `MutationObserver` | Not included | Keep it. It follows the manual theme switch | Small and useful | Keep |

After these changes, you can remove these packages: `radix-ui`, `embla-carousel-react`, `embla-carousel-wheel-gestures`, `react-icons`, `tailwindcss-animate` and possibly `@resvg/resvg-wasm`. Keep the `@fontsource-variable` packages, because the Fonts API loads the fonts from them. Check each removal with a build.

## Page-by-page review

Keep all 14 pages and their URLs. Each page gets simpler in the rebuild. The "Must keep" column is the feature checklist: tick each item when the new page has it.

| Page (URL) | Features now | Must keep | Suggested changes | Reason |
| --- | --- | --- | --- | --- |
| Home (`/) | Rotating text carousel with pause button (454 lines of script), 3 quick-link cards with large photos, Site Updates, CTA | Welcome text, 3 quick links, Site Updates, CTA | Keep the rotating text (your decision). Move it to src/components/site/. Keep the pause button. Stop the rotation for visitors who ask for reduced motion. Remove the astro:page-load code and run the script once on load`. Build the quick links with the Velocity `FeatureGrid` or `Card`. Use `CtaBand` for the CTA | Same look. Less script, and it meets WCAG 2.2.2 (pause, stop, hide) |
| About (`/about) | Hero, memoji, hobby and cat images (React carousel), FAQ accordion, policy cards, AboutPage schema | All content, policy cards, schema | Images: Velocity Carousel`. FAQ: Velocity `Faq` block. Consider `Timeline` for the site history | No React. Uniform sections |
| AI policy, Privacy, Terms (`/about/ai`, `/about/privacy`, `/about/terms`) | `PolicyLayout, clause helpers, cookie-settings button | All text and clause numbers | Keep your PolicyLayout` and helpers. Update Privacy for the new analytics set-up (see the analytics audit) | Works well now. Legal text must stay accurate |
| Photography (`/photography) | Hero, 2 React carousels (recent photos, more cats) with a lightbox | All photos, link to holidays | Velocity Carousel` for the rows. Keep the lightbox with the same behaviour (full-size view, next and previous, swipe, Esc to close), but build it on the Velocity Dialog (native HTML dialog) with a short script | Removes embla and radix. The largest saving of JS on the site |
| Holiday galleries (`/photography/holidays) | Content collection of 4 holidays, image cards, breadcrumbs | Cards, breadcrumbs, collection | Keep the collection. Move its schema to src/config/collections.ts` | Upgrades leave that file alone |
| Holiday gallery (`/photography/holidays/[slug]`) | React masonry gallery | All photos | CSS columns masonry in Astro (no React) | Same look with no JS |
| Shop (`/shop) | Sanity data at build time, React grid with sort and filter (shadcn Select and Sheet) | Sort, filter, product cards | Keep one small island for sort and filter. Use native <select>` and the Velocity `Sheet` | Sort and filter need script. The rest does not |
| Product (`/shop/[slug]) | React gallery, Vinted and eBay links (react-icons), features list, breadcrumbs | All product data, links, breadcrumbs | Velocity Carousel` for images. 2 SVG logos. Velocity `Icon` | Removes `react-icons` |
| Blog (`/blog`, `/blog/[slug]`) | Custom index, `BlogLayout, share buttons | All posts and URLs, share buttons | Use the Velocity blog views (reading time, typography, related posts). Add extra fields with blogFields` | Velocity fixed date, reading time and image bugs |
| Contact (`/contact) | Web3Forms with hCaptcha, React toast, FAQ accordion, contact cards | Web3Forms, hCaptcha, FAQ | Keep the form. Show the result in the existing status line, not a React toast. FAQ with the Faq` block | Removes one React island |
| 404 | Random memoji | Random memoji | Move it to `src/views/NotFoundView.astro` | Upgrades leave that file alone |
| Search (`/search`) | Not present | New | Turn on the Velocity search page | Finds posts, photos and products |
| RSS, sitemap, robots, manifest, social images | Present | All | Use the Velocity versions. Keep your manifest | Same result, less code |

**Shop question:** When you add a product in Sanity, how does the live site get it? A static site gets new Sanity data only when it builds again. If you start each build by hand now, we can add a Sanity webhook that starts a Cloudflare build automatically.

## Analytics and consent audit

**Decision (11 Nov 2026): Option 2, GA4 only, loaded only after the visitor says yes.** You keep the detail of Google Analytics. Tag Manager is not used.

**Current live site (checked in Cloudflare on 11 Nov 2026).** `PUBLIC_CONSENT_ENABLED` is `true` and `PUBLIC_GA_MEASUREMENT_ID is set. Tag Manager is not set. Thus the cookie banner is on, and GA4 runs in consent_mode_v2` ("advanced"): the Google script loads before the visitor chooses, sets no analytics cookies, and sends cookieless pings. GA4 sets cookies only after "Accept". This is a medium risk under the ICO guidance, not a missing-consent problem. To remove the risk on the current site (optional, before the upgrade):

1. In `src/config/consent.config.ts`, set `mode: 'strict'`. Increase `version` to `2`.
2. Push to `master`. Check that no request goes to Google before you select "Accept".

For visitors who accepted, the code probably sends 2 page views on the first page of each visit (one from `gtag('config')` and one from the `astro:page-load` listener). Velocity 2.6 does not have this listener, so the rebuild fixes it.

This audit is technical advice, not legal advice. It uses the ICO guidance on storage and access technologies (revised 29 April 2026) and the PECR changes from the Data (Use and Access) Act 2025, in force from 5 February 2026.

**What bandcov5 does now**

| Finding | Effect | Severity |
| --- | --- | --- |
| When both `PUBLIC_GA_MEASUREMENT_ID` and `PUBLIC_GTM_ID` are set, the code loads **only Tag Manager**. GA4 runs only if a GA4 tag is set up inside the Tag Manager container | If the container has no GA4 tag, you collect no data. If it has one, Tag Manager adds an extra script for one tag | High: check this |
| Consent mode is `consent_mode_v2` ("advanced"). Google scripts load before the visitor chooses, and send cookieless pings | The ICO guidance covers tracking that reads from or sends from the device, not only cookies. Pings before consent are a risk under PECR | High |
| The banner runs only if `PUBLIC_CONSENT_ENABLED` is `true` in Cloudflare | If this variable is not set, analytics loads with **no banner and no consent** | High: check this |
| The banner asks about Marketing and Preferences. The site has no adverts and no preference cookies | Visitors get choices that do nothing. More code and text | Medium |
| GA4-only path: `gtag('config')` runs on load, and again on `astro:page-load`, which also fires on the first load | Probably 2 page views for each first visit | Medium |
| 37 links send `site_navigation` events with Universal Analytics fields (`event_category`, `event_label`) | GA4 ignores the meaning of these fields. GA4 enhanced measurement already records outbound clicks | Low |

**Options**

|  | Option 1: Cloudflare Web Analytics (recommended) | Option 2: GA4 only, opt-in | Option 3: keep GA4 and Tag Manager |
| --- | --- | --- | --- |
| Cookies or device storage | None | Yes, after consent | Yes, after consent |
| Cookie banner | Not needed for analytics | Needed: 2 choices (Necessary, Analytics) | Needed |
| Data you get | Visits, pages, referrers, countries, devices, Core Web Vitals | All of Option 1, plus events, journeys and returning visitors | Same as Option 2 |
| Data for visitors who say no | All visits (no consent needed) | None | None |
| Scripts | 1 small Cloudflare script | Google tag | Tag Manager and Google tag |
| Data sent to Google | None | Yes | Yes |
| Cost | Free | Free | Free |
| Maintenance | Almost none | Low | Medium |

**Option 1 steps (recommended)**

1. In Cloudflare, turn on Web Analytics for `brightonandco.co.uk`.
2. Do not set `PUBLIC_GA_MEASUREMENT_ID` or `PUBLIC_GTM_ID`. Set `PUBLIC_CONSENT_ENABLED` to `false`.
3. If Cloudflare does not add the script automatically, add its beacon script once in your layout. Allow `static.cloudflareinsights.com` in the CSP.
4. Remove the "Cookie Preferences" link from the footer.
5. Update the Privacy page: say that you use Cloudflare Web Analytics, that it uses no cookies, and what it collects.

**Option 2 steps**

1. Remove `PUBLIC_GTM_ID` from Cloudflare. Keep `PUBLIC_GA_MEASUREMENT_ID`. Set `PUBLIC_CONSENT_ENABLED` to `true`.
2. In your `src/config/consent.config.ts` (yours, upgrades leave it alone): set `mode: 'strict'`. Keep only `necessary` and `analytics`. Increase `version` to `2`, so that each visitor chooses again.
3. In GA4, keep enhanced measurement on. Turn off Google signals and ads personalisation. Set data retention to 2 months.
4. Remove the global click listener and the 37 `data-analytics-nav` attributes. Keep 2 or 3 useful events, for example "contact form sent" and "shop link to Vinted or eBay".
5. Update the Privacy page: name Google as a recipient, give the retention period, and explain how to change the choice.

## Colours and design

Your colour system moves across almost unchanged. It is already a clean set of semantic tokens with contrast figures (for example, text `#161616` on page `#F2F6FC` at 16.7:1). In 2.6 it goes into a file that you own, so upgrades never change it.

**Where each part goes**

| Part | bandcov5 now (Velocity-owned file) | Velocity 2.6 (your file) |
| --- | --- | --- |
| Brand scale `--brand-50` to `--brand-900` (teal, `#119BA8`) | `src/styles/tokens/primitives.css` | New file `src/styles/brand.css` |
| Semantic tokens, light and dark | `src/styles/themes/default.css` | `src/styles/brand.css` |
| Active theme | Edited token files | `src/styles/theme.css`: import `default.css`, then `brand.css` |
| Logo and favicons | `src/assets/branding/`, `public/` | Same places |
| Name, links, theme colour | `src/config/site.config.ts` | Same file (yours) |
| Fonts (Manrope, Outfit) | `@fontsource` imports in `global.css` | Velocity already uses the same 2 fonts through the Fonts API |

**Tokens to check**

1. Velocity 2.6 adds tokens that your theme does not set: `--brand-hue`, `--theme-button-weight`, and `--success-foreground`, `--info-foreground`, `--info-light`, `--warning-foreground`, `--error-foreground`. Give each a value from your palette, or accept the Velocity value.
2. Your theme has 5 tokens that Velocity does not use: `--accent-strong`, `--background-cta`, `--cta-accent`, `--on-cta`, `--on-cta-muted`. Keep them in `brand.css` only if your CTA band still uses them. The Velocity `CtaBand` can use your brand colours.

**Accessibility and uniformity**

1. Keep every text colour at WCAG AA or better (4.5:1 for body text, 3:1 for large text and icons). Your current tokens already meet this. The Velocity axe tests check it on every page.
2. Use the Velocity spacing, radius and shadow tokens. Do not use fixed pixel values in pages. Then all pages look the same.
3. Use one heading style for each level. Your pages use many custom heading classes now. The Velocity `PageHero` and `Section` give one standard.
4. Keep "reduced motion". Velocity 2.6 stops all animations for visitors who ask for less motion.

**Design suggestions (optional)**

1. Home: keep the rotating text, with the pause button and reduced-motion support.
2. One CTA style on all pages, with `CtaBand`.
3. One card style for the home quick links, holidays and shop products. Visitors learn one pattern.

## Step-by-step guide in VSCode

Do these steps in the VSCode integrated terminal. The commands work in PowerShell (Windows) and in Terminal (Mac), except where the guide shows 2 versions. Commit after each step. Push after each phase. Claude Code in VSCode can do most of these steps for you, one phase at a time.

### Phase 1: Prepare

1. Install Node.js 24 LTS on both computers (from nodejs.org, or with `nvm`). Check with `node -v`. It must show `v24` or at minimum `v22.23.4`.
2. In VSCode, open the bandcov5 folder. Make sure there are no uncommitted changes. Run `git switch master` and `git pull`.
3. Make a copy of the old site for reference, beside the repository: `git worktree add ../bandcov5-old master. In VSCode, use **File > Add Folder to Workspace** to show bandcov5-old` next to `bandcov5`.
4. Make the branch: `git switch -c upgrade/velocity-2.6`.
5. Do the Cloudflare steps in Phase 1 of the next section (Node version and preview builds).

### Phase 2: Make the fresh 2.6.2 project

1. Go up one folder: `cd ..`
2. Make the project. With npm, put `--` before the options: `npm create velocity-astro@latest velocity-fresh -- -y --start blank --name "Brighton and Co" --no-install`
3. Go back: `cd bandcov5`
4. Remove the old site files from the branch, but keep the Sanity Studio, the plan, `CLAUDE.md`, `.mcp.json` and `wrangler.bandco.toml`: `git rm -r -q -- . ":!bandco-shop" ":!docs" ":!CLAUDE.md" ":!.mcp.json" ":!wrangler.bandco.toml"`
5. Copy the fresh project into the branch:
   - Windows: `robocopy ..\velocity-fresh . /E /XD .git node_modules` /XF CLAUDE.md
   - Mac: `rsync -a --exclude .git --exclude node_modules --exclude CLAUDE.md ../velocity-fresh/ ./`
6. Delete `pnpm-lock.yaml` if it is present. Run `npm install`. This makes a new `package-lock.json`.
7. Copy your `.env` from `../bandcov5-old/.env`. Remove any variable that Velocity 2.6 does not list in `.env.example`.
8. Run `npm run build`, then `npm run test`. Both must pass.
9. Commit: "Start from fresh Velocity 2.6.2". Push the branch. Check that Cloudflare makes a preview.

### Phase 3: Move the brand

1. Make `src/styles/brand.css with your brand scale and semantic tokens. Import it at the end of src/styles/theme.css`.
2. Copy your logo and favicon files to `src/assets/branding/` and `public/`.
3. Fill in `src/config/site.config.ts`: name, URL, description, social links, theme colour, `defaultTheme`.
4. Set the navigation in `src/config/nav.config.ts`.
5. Set up the header and footer through `src/components/site/SiteHeader.astro` and `SiteFooter.astro`.
6. Keep the build settings that your URLs need, in `astro.config.mjs`: `trailingSlash: 'never'` and `build.format: 'file'`. Remove the adapter set-up (see the Cloudflare section).
7. Run `npm run dev`. Check the empty site in light and dark mode. Commit.

### Phase 4: Move the pages, one at a time

Use this order: from the simplest page to the most complex.

1. Policies (AI, Privacy, Terms), with `PolicyLayout` and the clause helpers.
2. 404, in `src/views/NotFoundView.astro`.
3. About.
4. Blog: copy `src/content/blog/`. Add extra fields with `blogFields`.
5. Contact: Web3Forms, hCaptcha, FAQ.
6. Photography and holidays: copy the `holidays` collection to `src/config/collections.ts`.
7. Shop and product pages: copy `src/lib/sanity.ts`. Install `@sanity/client` and `@sanity/image-url`.
8. Home.

For each page:

1. Resize the page's images before you copy them (2560 px on the long side, JPEG quality 85).
2. Build the page with Velocity components. Use the page-by-page review.
3. Tick each item in the "Must keep" column.
4. Run `npm run validate`. Fix all errors.
5. Commit, push and check the Cloudflare preview on a phone and on a computer.

### Phase 5: Analytics, consent and security

1. Do the steps for the analytics option that you choose.
2. Allow Web3Forms and hCaptcha in the CSP on the contact page only.
3. Copy `public/_redirects`. Copy the useful rules from `public/_headers` (cache rules). Remove rules that the CSP now does.

### Phase 6: Test and go live

1. Run `npm run validate`, `npm run build` and `npm run test:e2e`. Run `npm run check:agent`.
2. Compare the old and new sitemaps. Each old URL must work or redirect.
3. Check the preview on Windows, Mac and a phone. Check light and dark mode.
4. Open a pull request from `upgrade/velocity-2.6` to `master`. Read the full change list.
5. Merge. Cloudflare builds and deploys `master`.
6. After 1 week with no problems, remove the old worktree: `git worktree remove ../bandcov5-old`. Delete `../velocity-fresh`.

**Future Velocity upgrades:** On a new branch, run `npx create-velocity-astro@latest upgrade --dry-run`, then `npx create-velocity-astro@latest upgrade`. Because you did not edit Velocity files, there are no conflicts.

## Cloudflare steps

**Checked on 11 November 2026 (read only).** These facts replace older text in this guide:

- `PUBLIC_CONSENT_ENABLED` = `true` is already set (since 26 July 2026). The consent fix for the live site is not necessary. Check that the banner shows before GA loads.
- There is no `NODE_VERSION` variable. It is not necessary: `.nvmrc` gives Node 24 (24.22.2 in the last build). npm is 10.9.2. Wrangler is 4.158.0.
- The site deploys with `wrangler.toml` (assets from `./dist`). On the 2.6 branch, Velocity replaces this file with its own version (name velocity, folder ./dist/client), and later upgrades replace it again. Thus put your settings in your own file wrangler.bandco.toml, with preview_urls = true (Phase 2 below).
- Branch pushes run `npx wrangler versions upload`. Preview URLs are on. Build caching is on for both triggers (11 November 2026).

Your site stays on the same Worker (`bandcov5`) with Workers Builds. You change 4 settings and test each branch on a preview address before it goes live.

### Phase 1: Before you push the branch

1. **Node version.** In the Cloudflare dashboard, go to **Workers & Pages > bandcov5 > Settings > Build > Build variables and secrets**. No change needed. Cloudflare reads .nvmrc (24) and the last build used Node 24.22.2.
2. **Preview builds.** Already on. Branch pushes run npx wrangler versions upload, and preview URLs are on. Each push to upgrade/velocity-2.6 gets a preview address. Check it in Workers & Pages > bandcov5 > Deployments, or in the build log.
3. **Production branch.** Make sure the Git branch for production is `master`. Only `master` changes the live site.
4. **Optional privacy for previews.** Preview addresses are public. To hide them, protect them with Cloudflare Access (free for small use).

### Phase 2: Keep the build static

Velocity 2.6 is made for a server adapter. On Cloudflare it sees `WORKERS_CI` and tries to load `@astrojs/cloudflare`. For a static site, do these 3 things:

1. In `astro.config.mjs` (your file), remove `adapter: target.adapter` and the `cache` provider lines. Keep `output: 'static'`.
2. Remove `src/actions/` and do not use the Velocity `ContactForm` and `NewsletterForm`. Astro needs a server for Actions, so the build fails if they stay.
3. Velocity owns `wrangler.toml`. Its version uses the name `velocity` and the folder `./dist/client. Do not edit it. Copy compatibility_flags from your old wrangler.toml if you still need them. Make your own file wrangler.bandco.toml`:

```
name = "bandcov5"
compatibility_date = "2026-05-05"
compatibility_flags = ["nodejs_compat"]
preview_urls = true

[assets]
directory = "./dist"
not_found_handling = "404-page"
```

Then in **Settings > Build**, set **Deploy command** to `npx wrangler deploy --config wrangler.bandco.toml`. Set the command for other branches to npx wrangler versions upload --config wrangler.bandco.toml. The handoff pull request adds wrangler.bandco.toml to master already, with the same settings as your current wrangler.toml. Thus you can change both commands after you merge that pull request, before the upgrade. Then do a test push to master and check that the live site still deploys. Test this on the first preview build.

### Phase 6: Go live and roll back

1. Merge the pull request into `master`. Workers Builds builds and deploys it.
2. Open `brightonandco.co.uk`. Check the home page, a blog post, a product, the contact form and the 404 page.
3. If there is a problem, go to **Workers & Pages > bandcov5 > Deployments** and roll back to the last deployment. This takes seconds. Then fix the problem on the branch.
4. Purge the cache only if old pages still show: **Caching > Configuration > Purge Everything**.

### Settings to keep

- Custom domain `brightonandco.co.uk` (and `new.brightonandco.co.uk` if you still use it).
- Build variables: `SITE_URL`, and the analytics variables for the option that you choose.
- `public/_redirects` and `public/_headers` work the same with Workers static assets.

## Move the work to VSCode and connect Claude to Cloudflare

### Continue in Claude Code in VSCode

Claude Code in VSCode reads files in the repository. The plan therefore goes into the repository, not into a chat.

1. When you approve this guide, we add 2 files to the branch `upgrade/velocity-2.6`:
   - `docs/upgrade-plan.md`: this guide, with checklists for each phase and page.
   - `CLAUDE.md`: the project rules for Claude (do not edit Velocity-owned files, npm only, static build, Web3Forms, Simplified Technical English).
2. In VSCode, run `git fetch` and `git switch upgrade/velocity-2.6`.
3. Open the Claude Code panel. Type, for example: "Read docs/upgrade-plan.md. Do Phase 2. Stop after the build passes."
4. After each phase, Claude Code ticks the checklist in `docs/upgrade-plan.md` and commits. This keeps the progress visible on both your Windows PC and your Mac.
5. Use plan mode (Shift+Tab) for each page. Claude shows the plan first, and you approve it before it changes files.

### Connect Claude to Cloudflare (optional)

With a connection, Claude can read your Worker, its build settings, deploy hooks, deployments and domains. Then it can do or check the Cloudflare steps in this guide. Cloudflare asks you which permissions to give. Give read access first. Add write access later, only when a step needs it.

There are 2 places to connect. Use Method 1 for the upgrade work.

**Method 1: Claude Code in VSCode (recommended, works on Windows and Mac)**

1. In the bandcov5 folder, make a file with the name `.mcp.json`. Put this text in it:

```json
{
  "mcpServers": {
    "cloudflare": {
      "type": "http",
      "url": "https://mcp.cloudflare.com/mcp"
    }
  }
}
```

2. Commit the file and push it. The file has no password or token, so it is safe in Git. Your other computer gets it with `git pull`.
3. Close and open VSCode again. Open the Claude Code panel. Claude Code asks if it can use the `cloudflare` server from this project. Select **Approve**.
4. In the Claude Code panel, type `/mcp` and press Enter. Select `cloudflare`, then **Authenticate**.
5. Your browser opens the Cloudflare sign-in page. Sign in. Select your account.
6. On the permissions page, select read permissions only (for example: Workers Scripts read, Workers Builds read, Zone read, DNS read). Select **Authorize**.
7. Go back to VSCode. `/mcp` must now show `cloudflare` as connected.
8. Test it. Type: "Use the Cloudflare server. List my Workers. Show the build settings, deploy hooks and custom domains of bandcov5. Do not change anything."
9. Do steps 4 to 8 one time on each computer. Each computer keeps its own sign-in.

**Method 2: this claude.ai project**

1. In claude.ai, go to **Settings > Connectors**.
2. Select **Add custom connector**. Name: `Cloudflare`. URL: `https://mcp.cloudflare.com/mcp`. Select **Add**.
3. Select **Connect**. Sign in to Cloudflare and select read permissions, as in Method 1.
4. Make sure that the connector is on for this project.
5. Tell me in this thread. I will check your Cloudflare settings against this guide.

The directory also has a "Cloudflare Developer Platform" connector. It can list Workers, KV and R2, but the custom connector above reaches the full Cloudflare API, including builds and domains.

**Safety rules**

- Do not paste a Cloudflare API token into a chat or into a file in Git. Sign-in (OAuth) does not need a token.
- Claude Code asks you before each tool call. Read each request before you approve it.
- To remove access, go to **Cloudflare dashboard > My Profile > API Tokens** (or **Connected apps**) and revoke the Claude entry. In Claude Code, `/mcp` also lets you clear the sign-in.

## Shop updates with a deploy hook

A static site shows a new Sanity product only after a new build. A deploy hook starts that build automatically when you publish in Sanity. Check if you have one:

1. In Cloudflare, go to **Workers & Pages > bandcov5 > Settings > Builds > Deploy Hooks**. If a hook is in the list, its "last triggered" date shows when it last ran.
2. In Sanity, go to **sanity.io/manage > your project > API > Webhooks**. Look for a webhook whose URL starts with https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/.

If both exist, it works. If not, make one:

1. In Cloudflare **Deploy Hooks**, enter the name `sanity-publish`, select the branch `master`, and select **Create**. Copy the URL.
2. In Sanity **Webhooks**, select **Create webhook**. Paste the URL. Dataset: `shop-dataset1`. Trigger on: create, update, delete. Method: POST. Save.
3. Publish a test change in Sanity. Check that Cloudflare starts a build.

The hook URL works as a password. Do not put it in Git or in a chat.

## Move from brightonandco.co.uk to bandco.uk

Move the domain after the upgrade is live and stable, as a separate change. Then, if a problem occurs, you know which change caused it. The move takes about 1 hour of work. Search results can take some weeks to change to the new domain.

**Before you start**

1. Make sure that you own `bandco.uk` and that it is in your Cloudflare account. If it is at a different registrar, add it to Cloudflare and change its nameservers, or transfer it to Cloudflare Registrar.
2. Check if you use email on `brightonandco.co.uk`. If you do, keep its MX records. Do not delete that domain.

**Steps**

1. **Connect the new domain.** In **Workers & Pages > bandcov5 > Settings > Domains & Routes**, select **Add > Custom domain**. Add `bandco.uk`. Add `www.bandco.uk` too.
2. **Change the site URL.** Set the build variable `SITE_URL` to `https://bandco.uk`. Change the URL in `src/config/site.config.ts`. Search the code and policy pages for `brightonandco.co.uk` and change each one. Push. The build updates canonical links, sitemap, RSS, social images and schema.
3. **Redirect the old domain.** In the `brightonandco.co.uk` zone, go to **Rules > Redirect Rules**. Make a rule: all requests, dynamic redirect to `concat("https://bandco.uk", http.request.uri.path)`, status 301, keep the query string. The old domain needs a proxied DNS record (orange cloud) for the rule to run. Remove the old domain from the Worker custom domains.
4. **Test.** Open some old URLs, for example `https://brightonandco.co.uk/shop`. Each must go to the same page on `bandco.uk` with status 301.
5. **Google Search Console.** Add `bandco.uk` as a Domain property (verify with DNS in Cloudflare). In the old property, use **Settings > Change of address**. Submit the new sitemap.
6. **Google Analytics.** In **Admin > Data streams**, change the stream URL to `https://bandco.uk`. Keep the same measurement ID.
7. **Other services.** Bing Webmaster Tools (site move). Web3Forms: if you limited the form to a domain, add `bandco.uk`. Social profiles, README and the web manifest.
8. **Keep the redirect.** Keep `brightonandco.co.uk` and its redirect for at minimum 1 year. Keeping it permanently is better: old links keep working.

## Open questions

1. ~~Analytics option~~ Answered: GA4 only, opt-in (Option 2).
2. ~~Analytics variables~~ Answered: GA ID and consent are set; Tag Manager is not. Optional: change to strict mode now.
3. **Shop updates:** Check the deploy hook with the steps in "Shop updates with a deploy hook".
4. ~~Home page~~ Answered: keep the rotating text.
5. ~~Photography lightbox~~ Answered: keep the same behaviour, built more simply.
6. **New domain:** Do you already own `bandco.uk, and is it in your Cloudflare account? Do you use email on brightonandco.co.uk`?

**To test in Phase 2 (not yet tested):** the static build with no adapter and no `src/actions/`, the `wrangler.bandco.toml` deploy and preview commands, and the first preview build of `upgrade/velocity-2.6`.

## Sources

- [Velocity repository (2.6.2)](https://github.com/southwellmedia-dev/velocity) and its `velocity-manifest.json`
- [create-velocity-astro CLI](https://github.com/southwellmedia/create-velocity-astro)
- [Velocity v1 to v2 upgrade guide](https://docs.deployvelocity.com/upgrade-guides/v1-to-v2/)
- [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Workers Builds: build branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)
- [Workers preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/)
- [Cloudflare MCP servers](https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/)
- [ICO cookie exceptions under the DUAA (Womble Bond Dickinson)](https://www.womblebonddickinson.com/uk/insights/articles-and-briefings/new-exceptions-non-intrusive-cookies-icos-updated-guidance-has)
- [Updated ICO guidance on storage and access technologies (Didomi)](https://www.didomi.io/blog/updated-ico-guidance-cookies-similar-technologies)
