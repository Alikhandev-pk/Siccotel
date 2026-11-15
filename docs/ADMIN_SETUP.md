# Admin panel and CMS setup (MySQL)

The site has a protected admin panel at `/admin`, backed by MySQL (or MariaDB) and a persistent uploads folder. Until a database is configured and the website import has run, every public page shows the content built into the code, so the site works throughout setup.

Everything that differs between machines is in environment variables (`.env.local` locally, the host's environment in production). Moving from the local demo to Hostinger means changing `DATABASE_URL` and, if needed, `UPLOAD_DIR`; no code changes.

| Variable | Purpose |
| :--- | :--- |
| `DATABASE_URL` | `mysql://user:password@host:3306/database`. Server-only. |
| `DATABASE_SSL` | `true` when the database host requires TLS (remote connections). |
| `UPLOAD_DIR` | Where uploaded images are stored. Defaults to `storage/uploads`, which is gitignored. It must persist across deploys. |

## Local demo on Windows

1. **Database server.** Any MySQL 8 or MariaDB 10.6+ works. Since 15 November 2026 the demo laptop runs **MySQL Community Server 8.4.11 LTS** (the official no-install ZIP, Oracle-signed) on **127.0.0.1:3308**, from `%LOCALAPPDATA%\siccotel-mysql`. It needs no installer and no admin rights. Start it with:
   ```powershell
   & "$env:LOCALAPPDATA\siccotel-mysql\mysql-8.4.11-winx64\bin\mysqld.exe" --defaults-file="$env:LOCALAPPDATA\siccotel-mysql\my.ini"
   ```
   Stop it cleanly with `mysqladmin -h 127.0.0.1 -P 3308 -u root shutdown`. The root password is in `%LOCALAPPDATA%\siccotel-mysql\root-password.txt` (local only, never committed). The X Protocol is off, and the server listens on 127.0.0.1 only.

   The previous **MariaDB 11.4.5** instance (port 3306, `%LOCALAPPDATA%\siccotel-mariadb`) is kept unchanged for rollback. Start it with:
   ```powershell
   & "$env:LOCALAPPDATA\siccotel-mariadb\mariadb-11.4.5-winx64\bin\mysqld.exe" --defaults-file="$env:LOCALAPPDATA\siccotel-mariadb\data\my.ini"
   ```
   **Rollback to MariaDB:** start it, swap the two `DATABASE_URL` lines in `.env.local` (the MariaDB one is kept there as a comment), then rebuild and restart the app. A pre-migration backup is in `%LOCALAPPDATA%\siccotel-backups\2026-11-15-before-mysql\`: a full SQL dump, a copy of `storage/uploads` and of `.env.local`.
2. **Database and user.** These are created once, with a password of your choice:
   ```sql
   CREATE DATABASE siccotel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'siccotel'@'127.0.0.1' IDENTIFIED BY 'your-password';
   GRANT ALL PRIVILEGES ON siccotel.* TO 'siccotel'@'127.0.0.1';
   ```
3. **`.env.local`:**
   ```
   DATABASE_URL=mysql://siccotel:your-password@127.0.0.1:3306/siccotel
   ```
4. **Schema:** `npm run db:migrate`. It applies `db/migrations/*.sql` once each, tracked in `schema_migrations`.
5. **First admin:** `npm run admin:create -- you@company.com "a-long-unique-password"`.
6. **Run:** `npm run build`, then `npm start`. Open `http://localhost:3000/admin/login` and click **Import the current website** on the Dashboard.

For a plain-HTTP local demo with `npm start`, `.env.local` also sets `INSECURE_LOCAL_COOKIES=true`, so the session cookie works without HTTPS. Never set it on a public server.

## Hostinger later

- **Engine and version:** Hostinger's support site says its Web and Cloud hosting databases run **MariaDB**, although hPanel labels them "MySQL Databases". Check the exact version in hPanel → Databases or phpMyAdmin (`SELECT VERSION();`) before moving. The app works on both engines: its SQL avoids engine-specific features, and the migrations have run on MariaDB 11.4.5 and MySQL 8.4.11.
- **Database:** hPanel → Databases → MySQL Databases. Create the database and user, then put them in `DATABASE_URL` (the host is shown in hPanel). Run `npm run db:migrate` and `npm run admin:create` against it.
- **Moving the existing records** (pages, drafts, banners, products, news, settings, media records and admin accounts), instead of re-importing:
  1. Dump the local data. Leave out `schema_migrations` and `sessions` (Hostinger's `db:migrate` fills the first, and old sign-ins should not carry over):
     ```powershell
     & "$env:LOCALAPPDATA\siccotel-mysql\mysql-8.4.11-winx64\bin\mysqldump.exe" -h 127.0.0.1 -P 3308 -u siccotel -p --single-transaction --no-tablespaces --set-gtid-purged=OFF --no-create-info --skip-triggers --ignore-table=siccotel.schema_migrations --ignore-table=siccotel.sessions siccotel > siccotel-data.sql
     ```
  2. On Hostinger, run `npm run db:migrate` first (it creates the tables), then import `siccotel-data.sql` with hPanel → phpMyAdmin → Import. Do not run `admin:create` first, or the imported admin row will clash with it.
  3. Compare row counts for `admins`, `documents`, `entries`, `media_assets` and `slug_redirects` with the local database.
- **Uploaded images:** copy the whole local `storage/uploads` folder, keeping its subfolders (`imported/`, `2026-11/`, …), into the server's `UPLOAD_DIR`. `media_assets.path` stores paths relative to that folder and pages reference them as `/media/<path>`, so the folder layout must stay the same. Copy it before switching traffic, and keep `UPLOAD_DIR` outside the deploy folder so redeploys don't wipe it.
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
- **Import:** the import is idempotent. It adds only missing items and never overwrites edits. Unpublished items stay unpublished, and deleted items stay deleted.
- **Nationwide Reach map:** city markers are percentages of the map, so a sharper replacement with the same layout stays aligned. If a new map has a different layout, update each city's `x`/`y` in Pages → Homepage.
