-- Siccotel CMS schema (MySQL 8 / MariaDB 10.6+). Applied by `npm run db:migrate`.
-- Content JSON is stored as LONGTEXT and parsed in code, which behaves the same on
-- MySQL and MariaDB (Hostinger). Public pages only ever read the `published` columns.

CREATE TABLE IF NOT EXISTS admins (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  disabled      TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session tokens are random; only their SHA-256 hash is stored.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64)    NOT NULL PRIMARY KEY,
  admin_id   CHAR(36)    NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY sessions_admin (admin_id),
  KEY sessions_expires (expires_at),
  CONSTRAINT sessions_admin_fk FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One row per page or settings block.
CREATE TABLE IF NOT EXISTS documents (
  `key`        VARCHAR(64) NOT NULL PRIMARY KEY,
  draft        LONGTEXT    NOT NULL,
  published    LONGTEXT    NULL,
  published_at DATETIME(3) NULL,
  updated_at   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_by   CHAR(36)    NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Banners, products and news.
CREATE TABLE IF NOT EXISTS entries (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  collection   VARCHAR(16)  NOT NULL,
  slug         VARCHAR(120) NULL,
  position     INT          NOT NULL DEFAULT 0,
  draft        LONGTEXT     NOT NULL,
  published    LONGTEXT     NULL,
  is_published TINYINT(1)   NOT NULL DEFAULT 0,
  published_at DATETIME(3)  NULL,
  updated_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_by   CHAR(36)     NULL,
  -- Set on imported rows so re-running the import never duplicates or resurrects
  -- them. Deletion is soft (deleted_at, slug cleared) for the same reason.
  seed_key     VARCHAR(191) NULL,
  deleted_at   DATETIME(3)  NULL,
  UNIQUE KEY entries_seed (seed_key),
  UNIQUE KEY entries_collection_slug (collection, slug),
  KEY entries_collection_position (collection, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_assets (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  path       VARCHAR(255) NOT NULL,
  url        VARCHAR(500) NOT NULL,
  mime       VARCHAR(64)  NOT NULL,
  size       INT          NOT NULL,
  width      INT          NOT NULL,
  height     INT          NOT NULL,
  alt        VARCHAR(500) NOT NULL DEFAULT '',
  file_name  VARCHAR(255) NOT NULL DEFAULT '',
  seed_key   VARCHAR(191) NULL,
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_by CHAR(36)     NULL,
  UNIQUE KEY media_path (path),
  UNIQUE KEY media_seed (seed_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
