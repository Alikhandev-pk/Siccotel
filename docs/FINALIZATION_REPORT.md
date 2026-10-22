# Website finalization — 22 October 2026

## Scope and changes

Preserved the existing brand colours, type families, navbar logo, routes, section order, copy, cards and buttons. Replaced only the hero's decorative 3D mark with genuine company photography, using a reserved 3:2 frame, a small caption and the existing entrance fade. The hero remains stacked below 1024px; desktop heading size and wrapping keep the text clear of the photograph.

Targeted fixes:
- About: prevented the core-value labels from overflowing 320px cards.
- Business: allowed manufacturing CTAs to wrap at 1024px.
- Manufacturing: removed pointer tilt from the product cards; the conceptual assembly still performs its existing entrance and then holds its pose.
- Animation lifecycle: business image tweens and retail pointer tweens are killed on cleanup. Existing shared Lenis ticker, native touch behavior, font/image refresh listeners and reduced-motion queries remain intact.
- Contact: clearing the URL enquiry type now clears the selected type, including browser back navigation.
- Rendering: wrapped pathname-dependent layout components in Suspense, fixing the production article/fallback route error with Next.js Cache Components and partial prefetching.
- Checks: repaired the existing standalone CommonJS QA script's lint failure and removed an unused import.

## Official hero photograph

Official company page: https://siccoteltelecom.com/

Original public asset: https://siccoteltelecom.com/wp-content/uploads/2025/05/151595535_30b0b463-0304-4e8e-91e2-e05f197cc6172.jpg

The asset was verified in the official public WordPress media catalog. It contains a photograph of the assembly floor inside a promotional banner. A rectangular photographic region was extracted without the banner decoration: left 60, top 190, width 720, height 480. No generated content, upscaling or photographic manipulation was used. The local result is `src/assets/company/siccotel-hero-assembly-floor.jpg`. It is served through Next Image with responsive sizes, preload, blur placeholder and reserved dimensions. The original 1359×1080 banner is retained at `.qa/official-assembly-banner.jpg` for local provenance review.

Other candidates included the official exterior and assembly banners and the chairman's portrait. The original factory-floor crop was chosen for its direct relevance, clear subject and lack of event graphics. The main site's factory page could not be safely read locally after Windows security flagged the downloaded HTML; its protection was left intact and the official Telecom source was used.

## Verification

- `npm.cmd run lint`: passed.
- `npx.cmd tsc --noEmit`: passed.
- `npm.cmd run build`: passed; 26 generated pages/metadata entries.
- `npm.cmd run dev -- --port 3001`: detected the existing project dev server on 3000 and correctly refused a duplicate instance. Existing dev preview was inspected; production was run separately using `npm.cmd run start -- --port 3001`.
- Production browser checks: 19 pages (home, six main routes and all 12 articles) at 320, 390, 768, 1024 and 1440px: 95 checks, no horizontal document overflow, missing rendered H1s or broken loaded images in the final pass.
- HTTP crawl: all 19 linked pages returned 200; 79 referenced assets returned successfully; no broken internal links or anchor targets. Reproducible check: `node .qa/http-audit.mjs`; result: `.qa/http-audit-result.json`.
- Fresh production article and unknown-article sessions: correct article / not-found UI and no console errors. The streaming unknown-article response is HTTP 200 with not-found content; the ordinary missing-page route returns 404.
- Mobile menu: opening, closing, Escape, navigation to Contact and route-close state passed.
- Form: empty submit displayed six required-field errors and a focusable summary. Synthetic valid local values displayed the explicit not-sent/unconfigured message and phone/email alternatives. No real enquiry or delivery-provider request was sent.
- Form URL state: brand enquiry link selected `brand`; browser Back to `/contact` cleared it.
- All ten original homepage sections remain in order.
- Manufacturing: product images and card ancestors have no transforms after entrance. Two separated screenshots of the assembly canvas were byte-identical after settling.
- Visual review: desktop hero at 1440 and 1024, mobile hero at 320 and 390, desktop manufacturing and pinned Business composition were inspected in Chrome. Saved screenshots are in `docs/screenshots/final/`. The 768px layout received DOM/geometry checks; it was not separately reviewed in a screenshot.

## Limits / remaining configuration

- Live enquiry delivery is unconfigured. The page states this before submission, with the official sales email and phone as alternatives. Production email/webhook credentials remain required.
- Reduced-motion behavior was reviewed in source (GSAP media-query cleanup, CSS and native scrolling); the available browser controls did not provide motion-preference emulation, so this was not visually emulated.
- The user's Chrome extensions inject attributes into page markup and produce development hydration warnings and extension script errors. These were identified separately; application hydration checks were not suppressed to hide them. A fresh production article/fallback session had no console errors.
- Nothing was published and no DNS or secret configuration was changed.
