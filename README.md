# Siccotel website

Corporate website for Siccotel (smartphone distribution, manufacturing and retail in Pakistan), with a built-in admin panel (CMS) for pages, banners, news and images.

- **Stack:** Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, GSAP with Lenis for motion, MySQL or MariaDB through `mysql2`, and `sharp` for uploaded images.
- **Public pages:** `/`, `/about`, `/services`, `/assembly`, `/partners`, `/news`, `/news/[slug]` and `/contact`.
- **Admin:** `/admin`. It needs a database, and accounts are invite-only.

For a code walkthrough, see [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md). Database moves and hosting details are in [docs/ADMIN_SETUP.md](docs/ADMIN_SETUP.md). Content sources and open client questions are in [docs/CONTENT_AUDIT.md](docs/CONTENT_AUDIT.md).

## Two ways the site runs

| Mode | `DATABASE_URL` | Content source | Admin |
| :--- | :--- | :--- | :--- |
| **Built-in content** | empty | The defaults in `src/lib/cms/defaults.ts` and `src/content/*` | Shows "not configured" |
| **CMS** | set | Published rows in MySQL, after the one-time website import | Works at `/admin` |

**The current Vercel preview runs in built-in content mode.** It has no database, so it always shows the content in the code. Changes made in a local admin never reach it. **The local admin runs in CMS mode** against a local MySQL database, and its edits appear only on that machine.

To make the admin control a live site, production must run in CMS mode. See [Production hosting](#production-hosting).

## Requirements

- Node.js 20.9 or newer (Next.js 16 needs it), with npm.
- For the admin: MySQL 8.0+ or MariaDB 10.6+.
- On Windows, if PowerShell blocks `npm` scripts, use `npm.cmd` in place of `npm`.

## Setup on Windows

### 1. Install and run the public site (no database)

```powershell
npm install
Copy-Item .env.example .env.local
```

To run on built-in content only, open `.env.local` and make the `DATABASE_URL=` line empty. Then start the development server:

```powershell
npm run dev
```

Open http://localhost:3000.

### 2. Add the database (admin panel)

1. **Install MySQL 8.4 LTS.** Use the MySQL Installer from dev.mysql.com, or the no-install ZIP. With the ZIP, initialise it once (`mysqld --initialize --console`), then start it with `mysqld --console` or `mysqld --defaults-file=<path to my.ini>`. Neither is a Windows service unless you install one, so start the server again after every reboot. MariaDB 10.6+ also works.
2. **Create the database and a user**, in the `mysql` client as root:
   ```sql
   CREATE DATABASE siccotel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'siccotel'@'127.0.0.1' IDENTIFIED BY 'choose-a-strong-password';
   GRANT ALL PRIVILEGES ON siccotel.* TO 'siccotel'@'127.0.0.1';
   ```
3. **Point the app at it** in `.env.local`. Use your port (3306 by default):
   ```
   DATABASE_URL=mysql://siccotel:choose-a-strong-password@127.0.0.1:3306/siccotel
   ```
4. **Create the tables:**
   ```powershell
   npm run db:migrate
   ```
   This applies `db/migrations/*.sql` in order. Each file runs only once, and `schema_migrations` records which have run. Run it again after pulling new migrations.
5. **Create the first admin.** There is no sign-up page:
   ```powershell
   npm run admin:create -- admin@example.com "a-long-unique-password"
   ```
   The password needs at least 12 characters. Running the same command for an existing email resets its password and signs out its sessions.
6. **Start the app and import the content.** Run `npm run dev`, open http://localhost:3000/admin/login and sign in. On the Dashboard, click **Import the current website**. This copies the built-in pages, banners, products and news, with their images, into the database. From then on, public pages show what is published in the admin. The import runs once: the button disappears afterwards, and running the import again would only add missing items.

### 3. Uploads

Images uploaded in the admin are stored under `UPLOAD_DIR` (default `storage/uploads`, which git ignores) and served at `/media/...`. Image details are kept in the `media_assets` table. Back this folder up together with the database: the database refers to these files by path.

Images that ship with the code live in `public/assets/` and are served at `/assets/...`. To move published uploads there, run `npm run cms:organize-images` (add `-- --dry-run` to preview) and rebuild. It copies each published upload into `public/assets`, points the content at the copy and backs up the rows it changes. After adding, renaming or removing files in `public/assets` by hand, run `npm run assets:manifest`.

## Commands

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Development server with hot reload |
| `npm run lint` | ESLint |
| `npm run typecheck` | Type check (generates the route types first, so it also works on a fresh checkout) |
| `npm run build` | Production build. In CMS mode, the database must be running. |
| `npm start` | Serves the production build. For plain-HTTP admin testing on localhost, set `INSECURE_LOCAL_COOKIES=true`. |
| `npm run db:migrate` | Applies new database migrations |
| `npm run admin:create -- <email> "<password>"` | Creates an admin or resets a password |
| `npm run cms:organize-images` | Copies published uploads into `public/assets` (`-- --dry-run` to preview) |
| `npm run assets:manifest` | Regenerates `src/content/asset-manifest.ts` from `public/assets` |

## Configuration

All settings are environment variables, listed with comments in [.env.example](.env.example). The main ones:

- `DATABASE_URL`, `DATABASE_SSL` and `UPLOAD_DIR` control the CMS.
- `NEXT_PUBLIC_SITE_URL` sets canonical URLs, the sitemap and structured data.
- `SITE_ALLOW_INDEXING=true` lets search engines index the site. Leave it unset until launch is approved.
- Enquiry form delivery: either Resend (`RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL`, `ENQUIRY_TO_EMAIL`) or a webhook (`ENQUIRY_WEBHOOK_URL`, plus an optional `ENQUIRY_WEBHOOK_SECRET`). With neither, the form reports that the message was **not** sent and points visitors to email. It never shows a false success.

## Production hosting

What the admin needs to control the live site:

1. **A Node.js server that runs the build continuously** (`npm run build`, then `npm start`, or the host's Node.js app runner). Serverless hosts such as Vercel can run the public site, but they have no persistent disk for uploads.
2. **A MySQL/MariaDB database** that the app can reach at build time and at runtime. Set `DATABASE_URL`, and set `DATABASE_SSL=true` if the host requires TLS. Run `npm run db:migrate` and `npm run admin:create` against it. Then either run the Dashboard import, or move the local data across (see [docs/ADMIN_SETUP.md](docs/ADMIN_SETUP.md)).
3. **A persistent `UPLOAD_DIR` outside the deploy folder**, so a redeploy does not delete uploads. When moving from a local setup, copy `storage/uploads` there and keep its subfolders.
4. **HTTPS**, with `INSECURE_LOCAL_COOKIES` unset, so the admin session cookie is marked `Secure`.
5. `NEXT_PUBLIC_SITE_URL` set to the public URL, an enquiry delivery option configured, and `SITE_ALLOW_INDEXING=true` only at launch.

A host such as Hostinger's Node.js Web Apps, with the database on the same account, meets all five. Keeping the public site on Vercel would need a remotely reachable database (so the database is open to the internet) and a separate home for uploads. Until then, Vercel can only serve built-in content.

Publishing in the admin refreshes affected pages immediately, with no redeploy. Code changes and images added to `public/assets` still need a new build.
