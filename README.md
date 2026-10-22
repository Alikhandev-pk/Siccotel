# Siccotel web

Local Next.js 16 / React 19 corporate website, with GSAP, Lenis and lazy-loaded React Three Fiber scenes. Previewing requires no deployment or DNS changes.

```sh
npm install
npm run dev
```

Open the local URL printed by Next.js. On Windows PowerShell with script execution restricted, use `npm.cmd` in place of `npm`.

```sh
npm run lint
npx tsc --noEmit
npm run build
npm start
```

The homepage includes company overview, distribution/manufacturing/retail, brand partners, regional map, manufacturing, company journey, news and enquiry paths. Existing About, Business, Manufacturing, Partners, News and Contact routes retain fuller content. Official sources and photograph provenance are in [docs/CONTENT_AUDIT.md](docs/CONTENT_AUDIT.md); implementation and verification details are in [docs/UPGRADE_REPORT.md](docs/UPGRADE_REPORT.md).

## Configuration

Copy `.env.example` to `.env.local` and configure an enquiry delivery provider before accepting live submissions. Configure either Resend email credentials and sender/recipient, or the webhook URL. A missing provider produces HTTP 503 and an explicit not-sent message; success requires an HTTP-success response from the delivery provider. Do not put secrets in `NEXT_PUBLIC_*` variables.

`NEXT_PUBLIC_SITE_URL` controls canonical URLs, sitemap entries and structured data. Search indexing remains disabled until `SITE_ALLOW_INDEXING=true` is explicitly configured for an approved launch. This upgrade is local-only.

## Motion and accessibility

Content and final statistics are server rendered. The hero uses a locally stored official assembly-floor photograph with reserved dimensions and a short fade. The manufacturing WebGL scene has an SVG fallback, stops after its entrance and pauses while offscreen or the tab is hidden. The shared GSAP ticker drives Lenis in milliseconds and R3F in seconds. Reduced-motion preferences disable scroll reveals and smooth scrolling; native route/history restoration remain under Next.js control.

Hero image provenance and the latest verification results are in [docs/FINALIZATION_REPORT.md](docs/FINALIZATION_REPORT.md).

Regional map city names are not proof of offices. Only published Karachi addresses appear as facilities. Publication dates are omitted where the source supplies only event context.
