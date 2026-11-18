# Siccotel web

Local Next.js 16 / React 19 corporate website, with GSAP on native scrolling. Previewing requires no deployment or DNS changes.

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

The homepage opens with a carousel of campaign banners from siccotel.com, followed by brand partners, company overview, distribution/manufacturing/retail, store and support paths, regional map, manufacturing, company journey, news and enquiry paths. Banners are configured in `src/content/hero.ts`; replace them there when a campaign ends. The header links to seven pages: About Us (`/about`), Services (`/services`), Assembly (`/assembly`), Products (`/products`), Partners (`/partners`), News & Media (`/news`) and Contact Us (`/contact`). The former `/business` and `/manufacturing` URLs redirect to `/services` and `/assembly`. Official sources and photograph provenance are in [docs/CONTENT_AUDIT.md](docs/CONTENT_AUDIT.md); implementation and verification details are in [docs/UPGRADE_REPORT.md](docs/UPGRADE_REPORT.md).

## Configuration

Copy `.env.example` to `.env.local` and configure an enquiry delivery provider before accepting live submissions. Configure either Resend email credentials and sender/recipient, or the webhook URL. A missing provider produces HTTP 503 and an explicit not-sent message; success requires an HTTP-success response from the delivery provider. Do not put secrets in `NEXT_PUBLIC_*` variables.

`NEXT_PUBLIC_SITE_URL` controls canonical URLs, sitemap entries and structured data. Search indexing remains disabled until `SITE_ALLOW_INDEXING=true` is explicitly configured for an approved launch. This upgrade is local-only.

## Motion and accessibility

Content and final statistics are server rendered. Hero banners are contained rather than cropped, with their space reserved by the artwork's aspect ratio; only the first is preloaded. Each banner shows for 5 seconds with a 0.5-second crossfade. Rotation holds while the tab is hidden or the carousel has keyboard focus, and is off with reduced motion; a pause/resume control appears on keyboard focus. Scrolling is native: there is no smooth-scroll library, and CSS `scroll-behavior: smooth` must stay off because ScrollTrigger refreshes interrupt it, which leaves anchor links short of their target. Reduced-motion preferences disable reveals and autoplay; `ScrollManager` handles route and history positions.

Earlier hero provenance and verification results are in [docs/FINALIZATION_REPORT.md](docs/FINALIZATION_REPORT.md); banner sources are in [docs/CONTENT_AUDIT.md](docs/CONTENT_AUDIT.md).

Regional map city names are not proof of offices. Only published Karachi addresses appear as facilities. Publication dates are omitted where the source supplies only event context.

## Admin panel (CMS)

Content is editable at `/admin`: banners, products, news, the media library, the homepage, every page's copy and images, and the contact settings. It uses MySQL (or MariaDB) and a persistent uploads folder, and stays inactive until configured: the site shows its built-in content until then. Setup, first-admin provisioning, the website import and the security model are in [docs/ADMIN_SETUP.md](docs/ADMIN_SETUP.md).

Site images are in `public/assets/` (`products/`, `articles/`, `banners/`, `logos/`, `website/`) and are served at `/assets/...`. After publishing new images in the admin, run `npm run cms:organize-images` and rebuild so they move there too; see the Media notes in the admin guide.
