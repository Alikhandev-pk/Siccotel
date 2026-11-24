# Admin panel and CMS setup (MySQL)

The site has a protected admin panel at `/admin`, backed by MySQL (or MariaDB) and a persistent uploads folder. Until a database is configured and the website import has run, every public page shows the content built into the code, so the site works throughout setup.

Everything that differs between machines is in environment variables (`.env.local` locally, the host's environment in production). Moving from a local setup to a server means changing `DATABASE_URL` and, if needed, `UPLOAD_DIR`; no code changes.

| Variable | Purpose |
| :--- | :--- |
| `DATABASE_URL` | `mysql://user:password@host:3306/database`. Server-only. |
| `DATABASE_SSL` | `true` when the database host requires TLS (remote connections). |
| `UPLOAD_DIR` | Where uploaded images are stored. Defaults to `storage/uploads`, which is gitignored. It must persist across deploys. |

## Local setup

The Windows steps are in the [README](../README.md#setup-on-windows): install MySQL, create the database and user, `npm run db:migrate`, `npm run admin:create`, then **Import the current website** on the admin Dashboard. The import button appears only until the first import has run.

For a plain-HTTP local test with `npm start`, set `INSECURE_LOCAL_COOKIES=true` in `.env.local` so the session cookie works without HTTPS. Never set it on a public server.

## Moving to production (for example Hostinger)

- **Engine and version:** Hostinger's support site says its Web and Cloud hosting databases run **MariaDB**, although hPanel labels them "MySQL Databases". Check the exact version in hPanel → Databases or phpMyAdmin (`SELECT VERSION();`) before moving. The app works on both engines: its SQL avoids engine-specific features, and the migrations have run on MariaDB 11.4.5 and MySQL 8.4.11.
- **Database:** hPanel → Databases → MySQL Databases. Create the database and user, then put them in `DATABASE_URL` (the host is shown in hPanel). Run `npm run db:migrate` and `npm run admin:create` against it.
- **Moving the existing records** (pages, drafts, banners, products, news, settings, media records and admin accounts), instead of re-importing:
  1. Dump the local data with `mysqldump` from your MySQL `bin` folder (adjust the port). Leave out `schema_migrations` and `sessions` (the server's `db:migrate` fills the first, and old sign-ins should not carry over). `--set-gtid-purged=OFF` is for MySQL's `mysqldump`; drop it with MariaDB's:
     ```powershell
     mysqldump -h 127.0.0.1 -P 3306 -u siccotel -p --single-transaction --no-tablespaces --set-gtid-purged=OFF --no-create-info --skip-triggers --ignore-table=siccotel.schema_migrations --ignore-table=siccotel.sessions siccotel > siccotel-data.sql
     ```
  2. On Hostinger, run `npm run db:migrate` first (it creates the tables), then import `siccotel-data.sql` with hPanel → phpMyAdmin → Import. Do not run `admin:create` first, or the imported admin row will clash with it.
  3. Compare row counts for `admins`, `documents`, `entries`, `media_assets` and `slug_redirects` with the local database.
- **Uploaded images:** copy the whole local `storage/uploads` folder, keeping its subfolders (`imported/`, `2026-11/`, …), into the server's `UPLOAD_DIR`. `media_assets.path` stores paths relative to that folder and pages reference them as `/media/<path>`, so the folder layout must stay the same (published images are in `public/assets` and deploy with the code). Copy it before switching traffic, and keep `UPLOAD_DIR` outside the deploy folder so redeploys don't wipe it.
- **Where the app runs:**
  - The admin needs a Node.js server with a persistent disk for `UPLOAD_DIR`.
  - Hostinger's Node.js Web Apps (Business and Cloud plans) can run this Next.js app next to the database. In that case use `localhost` as the database host, and point `UPLOAD_DIR` at a folder outside the deploy directory so uploads survive redeploys.
  - Keeping the public site on Vercel is possible only with Remote MySQL enabled in hPanel. Vercel's outbound IPs change unless you use its paid Static IPs, so that means allowing "any host", which is less secure. Vercel also has no persistent disk for uploads. Running the app on Hostinger avoids both problems.
- **Session cookie:** keep `INSECURE_LOCAL_COOKIES` unset in production, so the cookie is `Secure`.

## How it works

- **Accounts:**
  - Admins are invite-only, created with `npm run admin:create`. There is no sign-up page.
  - Passwords are hashed with scrypt.
  - Sessions are random 256-bit tokens in an httpOnly cookie, and only a SHA-256 hash of each token is stored in the `sessions` table. Sessions expire after 7 days, and signing out deletes them.
  - Five failed sign-ins lock that email for a minute.
- **Authorisation:** every admin page, server action, read and upload re-checks the session in MySQL on the server (`src/lib/cms/auth.ts`). Database credentials never reach the browser.
- **Drafts versus published:**
  - Content rows keep a `draft` and a `published` version, and public pages select only `published`.
  - **Save draft** leaves the live page unchanged. **Publish** makes the current version live and refreshes the affected pages immediately, with no deployment.
  - **Unpublish** removes a banner, product or article from every public page.
- **Media:**
  - Uploads are checked on the server: only real JPEG, PNG, WebP, AVIF or GIF images up to 8 MB are accepted.
  - Files are stored under `UPLOAD_DIR` with random names and served at `/media/...`. Their metadata is stored in `media_assets`.
  - A file still used by any page, banner, product or article, in either its draft or published version, cannot be deleted.
  - **Published images live in `public/assets/`**, sorted into `products/`, `articles/` (news covers and galleries), `banners/`, `logos/` (brand, partner and client logos) and `website/` (every other page image), and published content points at `/assets/...`. A newly chosen or uploaded image is published from `/media/...` first; `npm run cms:organize-images` then copies it, byte for byte, into the matching folder and points drafts and published versions at the public copy. Run it before `npm run build`: Next.js serves only the public files present at build time, so rebuild after running it on a live server. It is safe to rerun (`-- --dry-run` reports without changing anything), reuses identical files instead of copying them twice, never overwrites or deletes a file, backs up the rows it changes to `storage/backups/`, and leaves draft-only images and every upload original in `UPLOAD_DIR`, so the media library is unchanged.
  - Code refers to files in `public/assets` through `src/content/asset-manifest.ts` (sizes and blur placeholders), generated by `npm run assets:manifest`. Run it after adding, renaming or removing a file there by hand.
- **Import:** run once from the Dashboard on an empty database. Content images from `public/assets` keep their `/assets/...` URLs; a managed copy is also stored so the media library lists them. The import is idempotent. It adds only missing items and never overwrites edits. Unpublished items stay unpublished, and deleted items stay deleted.
- **Nationwide Reach map:** city markers are percentages of the map, so a sharper replacement with the same layout stays aligned. If a new map has a different layout, update each city's `x`/`y` in Pages → Homepage.
