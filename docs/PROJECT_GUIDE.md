# Project guide

A short technical map of the Siccotel website for developers taking it over. Setup and commands are in the [README](../README.md).

## Folders

| Path | Contents |
| :--- | :--- |
| `src/app/` | Routes (App Router). Public pages, `admin/` (CMS), `api/` (enquiry form and admin uploads), `media/[...path]` (serves uploads), `preview/news/[id]` (admin draft preview), `sitemap.ts`, `robots.ts` |
| `src/components/` | Shared UI: header, footer, `sections.tsx` (page hero, logo strip, news cards), `ui.tsx` (buttons, links, section headers), `EnquiryForm`, `EnquiryPaths`, `SocialIcon` |
| `src/components/home/` | Homepage sections: hero carousel, business cards, retail clients, reach map, company journey timeline, WhatsApp button |
| `src/components/animations/` | GSAP motion: scroll reveals, Lenis smooth scrolling, page-level motion (`PageMotion`), scroll restoration (`ScrollManager`), header auto-hide |
| `src/components/admin/` | Admin UI: schema-driven form, collection lists and editors, media library and picker |
| `src/content/` | Built-in facts and default content: company details, navigation and enquiry types, partners, news, milestones. `asset-manifest.ts` (generated) holds the sizes and blur placeholders of `public/assets` |
| `src/lib/cms/` | CMS core: database access, auth, public reads, defaults, schemas, types, media storage |
| `src/lib/` | Site helpers: `site.ts` (URL and indexing flags), `enquiry.ts` (shared form validation), `contact-links.ts` (emails and WhatsApp from Settings), GSAP and Lenis setup |
| `db/migrations/` | Numbered SQL migrations, applied by `npm run db:migrate` |
| `scripts/` | CLI tools: migrations, admin creation, asset manifest, image organiser, map-region tracer |
| `public/assets/` | Images that ship with the code (`banners/`, `articles/`, `logos/`, `products/`, `website/`) |
| `storage/uploads/` | Admin uploads (default `UPLOAD_DIR`). Not in git |

## Public routes

`/` home · `/about` · `/services` · `/assembly` · `/partners` · `/news` and `/news/[slug]` · `/contact`

- **Redirects** (`next.config.ts`): `/products` goes to `/`, `/business` to `/services` and `/manufacturing` to `/assembly`. A news article whose slug changed redirects permanently to its current slug (`slug_redirects` table).
- **Contact form:** `/contact?type=dealer|brand|general` preselects an enquiry type. The retired `?type=manufacturing` maps to `brand` (`resolveEnquiryType` in `src/content/navigation.ts`).
- **`POST /api/enquiry`:** validates with the same rules as the browser (`src/lib/enquiry.ts`), has a honeypot field and a per-IP rate limit, and delivers by Resend or a webhook. Without a delivery option it returns 503, and the form says the message was not sent.

## Content source: built-in or database

`src/lib/cms/public.ts` is the only way public pages read content (`getDoc`, `getSettings`, `getBanners`, `getNews`, `getArticle`).

- Without `DATABASE_URL`, or before the one-time import has written the `_meta` marker document, every getter returns the built-in defaults from `src/lib/cms/defaults.ts`. **The Vercel preview runs this way.**
- After the import, the database is authoritative. Stored documents are laid over the defaults (`mergeContent` in `merge.ts`): objects merge key by key, so fields added in code later still get a value, while lists replace the defaults outright, so deleted items stay deleted.
- A failed database read throws instead of falling back to the defaults, because the defaults still contain items admins have deleted.

## Admin authentication

- Admins are created only with `npm run admin:create`. There is no sign-up page or password-reset email.
- Passwords are hashed with scrypt (`password.ts`). Sign-in compares against a dummy hash for unknown emails, so response timing does not reveal which emails exist.
- A session is a random 256-bit token in an httpOnly, SameSite cookie, `Secure` in production. Only its SHA-256 hash is stored in `sessions`. Sessions last 7 days, and signing out deletes them.
- `checkAdmin()` in `auth.ts` verifies the cookie against the database on every call. Admin pages use `requireAdminPage`/`isAdminRequest`. Server actions and API routes use `requireAdmin()`, which throws unless the caller is an admin.
- `src/proxy.ts` (Next 16's middleware) only adds `X-Robots-Tag: noindex` to admin and preview URLs. Authorisation always happens on the server, not in the proxy.
- Five failed sign-ins lock that email for one minute.

## Draft and publish

- **Documents** (one per page, plus `settings`) and **entries** (banners, products, news) each store a `draft` and a `published` JSON copy.
- **Save draft** writes `draft` only. **Publish** copies it to `published` (for entries, it also sets `is_published` and the published slug). **Unpublish** hides an entry. Deleting an entry is a soft delete (`deleted_at`).
- Public reads select only `published` columns, so drafts never reach visitors. Admins can view an unpublished article at `/preview/news/[id]`.
- Admin forms are generated from the field definitions in `src/lib/cms/schemas.ts`, and the content shapes are typed in `types.ts`. To add a field, add it to the type, the defaults and the schema. Existing records pick up the default value through the merge.

## Cache refresh

- Public reads are wrapped in `"use cache"` with `cacheTag("cms")` and `cacheLife("minutes")` (Cache Components, enabled in `next.config.ts`).
- Every publish, unpublish, delete and reorder calls `refreshPublicSite()` in `src/app/admin/actions.ts`. It runs `updateTag("cms")` and `revalidatePath("/", "layout")`, so the next request shows the change with no redeploy.
- The minutes-long cache lifetime is a safety net: another server instance that missed the tag still updates within a few minutes.
- Pages are prerendered at build time, so **a build in CMS mode needs the database running**.

## Media

1. The admin shrinks photos over 8 MB in the browser (`prepare-upload.ts`), then posts the file to `POST /api/admin/media`.
2. On the server, `storeImage` in `media-store.ts` checks the real file contents with `sharp`: JPEG, PNG, WebP, AVIF or GIF, up to 8 MB and 12,000 px. It writes the file under `UPLOAD_DIR/YYYY-MM/` with a random name and adds a row to `media_assets`.
3. `GET /media/...` serves uploads, refusing any path that escapes the folder.
4. An image used by any draft or published content cannot be deleted.
5. `npm run cms:organize-images` copies published uploads into `public/assets/` and repoints the content, so images can be deployed with the code. It never deletes uploads.

## Key files for a technical interview

| File | Why it matters |
| :--- | :--- |
| `src/lib/cms/public.ts` | Built-in versus database content, caching and tags |
| `src/lib/cms/merge.ts` | How stored content is laid over the code defaults; link sanitising |
| `src/app/admin/actions.ts` | Every admin write: sign-in, save, publish, unpublish, reorder, media, cache refresh |
| `src/lib/cms/auth.ts`, `password.ts` | Sessions, server-side authorisation, scrypt |
| `src/lib/cms/schemas.ts`, `types.ts`, `defaults.ts` | The content model and its admin forms |
| `src/lib/cms/media-store.ts`, `src/app/api/admin/media/route.ts`, `src/app/media/[...path]/route.ts` | Upload checks, storage and serving |
| `src/app/admin/import-action.ts` | The one-time import into an empty database |
| `src/app/api/enquiry/route.ts`, `src/lib/enquiry.ts`, `src/components/EnquiryForm.tsx` | Form validation and honest delivery feedback |
| `src/components/SiteHeader.tsx` | Navigation, accessible mobile menu (focus, scroll lock, `data-menu-open`) |
| `src/components/home/JourneyRail.tsx` | Company timeline: a snap-scrolling rail showing 1, 2 or 3 whole milestones (phone, tablet, desktop), with Previous/Next buttons and arrow keys |
| `src/components/animations/*`, `src/lib/reveals.ts` | Motion. Everything respects `prefers-reduced-motion`, and content is in the server HTML before any animation |

## Known limitations

- **Production CMS hosting is not set up yet.** The Vercel preview shows built-in content only, and admin edits exist only in the local database. See README, "Production hosting".
- **Published images still on `/media`:** 10 images published in the local database are served from `storage/uploads`. Before deploying that database, copy `storage/uploads` to the server's `UPLOAD_DIR`, or run `npm run cms:organize-images` and rebuild.
- **Enquiry delivery is not configured.** Until Resend or a webhook is set, the form honestly reports that messages are not sent.
- **Products are not shown publicly.** The Products page and featured placements were removed in November 2026, but the Products collection and Products page document stay editable in the admin, so they can return.
- **Two reveal mechanisms:** `components/Reveal.tsx` (data attributes animated by `PageMotion`, used on inner pages) and `components/animations/Reveal.tsx` (a GSAP component, used on the homepage). Both work. Merging them would be a design-sensitive refactor.
- **In-memory limits:** the sign-in lockout and the enquiry rate limit live in server memory, per process. With several instances, use a shared store.
- **No automated tests.** Checks are lint, type check, production build and manual browser testing.
- **Admin accounts:** there is no password-reset email or account-management screen. Use `npm run admin:create`.
- **Phone number:** only the header top bar shows a phone number (+92 326 8400903, also the WhatsApp number). Whether a general phone number should appear elsewhere is still open with the client (see `CONTENT_AUDIT.md`).
