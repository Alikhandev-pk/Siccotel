# Siccotel website upgrade

Completed locally on 22 October 2026. No publishing or DNS changes were made. The supplied attachment contained the brief only, so the described recording could not be reviewed directly. The existing running build supplied the visual baseline; source inspection and local development/production previews supplied the implementation evidence.

## Root causes

| Reported issue | Finding and correction |
| --- | --- |
| Hero wrapped into short lines | Persistent desktop layout issue: a 92px, expanded headline occupied a roughly 576px column at 1440px. A wider text region and responsive 37–68px type now produce two desktop lines. Smaller screens wrap naturally. |
| Emblem lacked readable depth | Silver walls, decorative orbit rings, a large entrance turn and continuous scroll/time transforms weakened the red silhouette. The original SVG path now has dark red extrusion, a subtle bevel, restrained studio lighting and a near-frontal pose. |
| Exaggerated 3D movement | The manual R3F renderer received GSAP seconds multiplied by 1,000. R3F's manual clock consumes seconds; Lenis separately consumes milliseconds. The units are now correct at each API boundary. |
| Empty space and hidden business content | Desktop chapters shared one grid cell inside a long pin, and shorter desktop screens hid their bullet lists. All three businesses now remain in document flow. Obsolete pin CSS was removed. |
| Journey heading clipping | Heading clip masks and tight line boxes could cut moving text; a module-level first-page flag also made reveal setup inconsistent under Strict Mode and history navigation. Heading masks and that shared mutable state were removed, line heights were opened up, and revealed headings remain readable throughout their short entrance. |
| Unbalanced news | The former seven-column lead card sat beside two stacked cards, leaving unused space beneath the lead. Three equal cards now share one responsive grid. The square PTA photograph also needed its own top focal point. |
| Route/form reliability | News URL parameters needed a page-level Suspense boundary with this Next.js version's partial prefetching. Form category selection previously synchronized only on mount/popstate. It now follows query changes without clearing typed fields. The API now rejects primitive/array/null JSON safely. |

The desktop wrapping and news imbalance were persistent. The business pin depended on viewport size/height. Heading clipping and hidden reveals were related to animation and navigation state. Temporary white/partial captures taken before the browser painted were rechecked after rendering; they were not treated as persistent site defects.

## Section changes

| Section | Result |
| --- | --- |
| Hero | Two independent layout regions, deliberate wide-screen headline wrapping, concise copy, primary Partner With Us CTA, secondary Explore Our Business CTA and verified trust line. Text, controls and a dimensional SVG fallback render without WebGL. Mobile order is text, controls, then visual. |
| Company overview | Editorial copy and two non-overlapping photographs in their original proportions. Compact, server-rendered final statistics remain readable without counter JavaScript. |
| Business | Three clear distribution/manufacturing/retail compositions with useful detail links. Authentic assembly-floor photography replaces the manufacturing product render. Tablet rows avoid oversized images. |
| Partners | Genuine logos retain their aspect ratios, fit narrow cells and remain visible without hover. Relationship labels preserve distribution, exclusivity and Apple reseller distinctions. |
| Manufacturing | Official assembly-floor photography leads the homepage; the manufacturing route adds the verified factory exterior. Facility area and delivery chain remain factual. The conceptual phone is smaller, clearly labeled, and stops after its entrance. |
| Nationwide presence | Original map colors/ratio retained; unverified route arcs removed. City buttons have 44px targets. Only Karachi displays verified facility addresses; other cities explicitly state that a local address is unavailable. |
| Journey | A compact wrapping timeline replaces scrubbed, dimmed copy. All documented milestone text remains visible and headings have no clipping wrapper. |
| News | Equal image ratios, balanced cards, real article links, descriptive image alternatives and a subject-aware PTA crop. No publication dates were invented. All twelve article routes remain. |
| Enquiry | Clear partnership categories now link to a preselected form category. Existing validation/delivery behavior remains, with stricter malformed-body handling and preserved typed fields during category changes. Success still requires confirmed API success. |
| Header/footer | Opaque scrolled header and shorter contrast transition; accessible mobile menu retained. Footer spacing and mobile columns are more compact, with verified contact/social links. WhatsApp now uses the officially published number. |

## Motion and performance

Installed versions were inspected: Next 16.4.2, React 19.3.0, GSAP 3.15.0, Lenis 1.3.27, Three 0.186.1, R3F 9.8.2 and Drei 10.7.9. Relevant installed Next guides and official animation-library documentation were consulted.

Lenis uses one explicit GSAP-driven loop with `autoRaf: false`. Scenes use that shared ticker and R3F's manual renderer, with capped DPR (maximum 1.5), small environment maps and explicit geometry disposal. Both scenes stop rendering after their entrance and suspend drawing offscreen or in a hidden tab. WebGL code is lazy loaded, with WebGL2 detection, error/context-loss handling and a permanent static fallback.

Route-scoped GSAP contexts clean up listeners/triggers. Setup waits until after React commit; visible/restored content is not re-hidden. Font/image/size changes refresh measurements. Next retains ownership of route scroll and history restoration. Reduced-motion branches disable smooth scrolling, CSS entrances and scroll reveals; section body copy does not translate.

## Checks actually performed

- `npm.cmd run lint`: passed after the final source changes.
- TypeScript checks passed, including the final production build's typecheck.
- `npm.cmd run build`: passed, generating 26 pages without a build error.
- Live Chrome layout checks and captures at 320, 390, 768, 1024 and 1440px. At every width, document scroll width equaled client width; no pin spacer or hidden/clipped main heading remained after reveals. Measurements are in [screenshots/metrics.json](screenshots/metrics.json).
- Source and screenshot review of business, map, journey and news at 320/768/1440px; overview/manufacturing/enquiry at 390/1024px. Follow-up review confirmed the PTA crop and original-ratio company photographs.
- Downward scrolling and reverse desktop scrolling; headings remained unmasked and visible. Mid-page production reload restored the same native scroll position (4648.8px in that check).
- Hero CTA/visual ordering and fit, mobile menu opening, Escape closing, focus return and scroll-lock cleanup.
- Region selection: Lahore displayed the unavailable-address state, while Karachi retained the two verified addresses.
- Production article soft navigation, correct article title, browser back and zero leftover pin spacers. The former Next URL-data warning did not recur in the corrected production session.
- The final phone scene was captured twice, 1.6 seconds apart, while fully visible and settled. Cropped raw RGB pixels were identical (0 changed bytes across 228,096 bytes). The actual crops are [phone-a.jpg](screenshots/phone-a.jpg) and [phone-b.jpg](screenshots/phone-b.jpg). An earlier comparison using screenshot clip coordinates was discarded because it did not include the visible WebGL scene.
- The 320px distribution photograph loaded during ordinary scrolling (`complete=true`, `naturalWidth=320`). A blank tile in an earlier jump-to-end capture was a lazy-loading capture artifact.
- All seven primary pages and twelve article URLs returned HTTP 200. Twenty-five distinct local anchor destinations matched IDs in rendered output.
- Empty-form UI validation produced six required-field errors. Name entry survived brand/manufacturing category changes; no success message appeared. Eleven intentionally invalid API cases returned the expected 400/413/415 responses. No real enquiry or third-party delivery request was sent.
- Final production console review showed no application error in that session. R3F still emits the upstream `THREE.Clock` deprecation warning. Earlier development warnings included browser-extension-injected attributes; those were not hidden with broad hydration suppression.

## Verification limits and remaining configuration

- The available browser emulation capability exposed viewport sizing only. Reduced-motion behavior was reviewed in source, but an actual reduced-motion browser session was not emulated. WebGL failure/context loss and hidden-tab rendering suspension were also source-reviewed, not forcibly induced.
- Five viewport checks are responsive desktop-browser checks, not physical-device or cross-browser certification.
- Enquiry delivery credentials/webhook remain unconfigured. Successful real delivery was deliberately not tested. Configure `.env.local` from [.env.example](../.env.example) before accepting live messages; missing delivery configuration returns 503 rather than success.
- `NEXT_PUBLIC_SITE_URL` remains unset and indexing remains disabled by default. Neither hosting nor DNS was changed.
- The development server logged intermittent Google Font fetch failures and used fallback fonts. The production builds completed and their bundled font assets were used for the final captures; a clean uncached build still needs access to the configured Google Font source.
- The original source does not publish nine regional-city addresses or article publication dates. Conflicting production-capacity figures remain excluded. Source/provenance details are in [CONTENT_AUDIT.md](CONTENT_AUDIT.md).

## Captures

- [Desktop before/after comparison](screenshots/comparison-1440.jpg)
- [390px mobile hero](screenshots/after-390.jpg)
- [Company overview](screenshots/final-glance-title.jpg)
- [Balanced news grid](screenshots/final-news-title.jpg)
- [Visible manufacturing scene](screenshots/manufacturing-detail.jpg)

Full-page captures are also retained for layout review. Offscreen WebGL surfaces and lazy images can be absent from such captures; the visible-scene captures above are the relevant visual evidence for those assets.
