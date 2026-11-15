-- News editor support. Additive only: existing articles and their content are untouched.
--
-- `published_slug` is the URL the live version uses. The editable `slug` is part of the
-- draft, so renaming an article's URL takes effect only when it is published.
ALTER TABLE entries ADD COLUMN published_slug VARCHAR(120) NULL AFTER slug;
UPDATE entries SET published_slug = slug WHERE published IS NOT NULL AND deleted_at IS NULL;

-- When a published slug changes, the old URL keeps working by redirecting here.
CREATE TABLE IF NOT EXISTS slug_redirects (
  collection VARCHAR(16)  NOT NULL,
  old_slug   VARCHAR(120) NOT NULL,
  entry_id   CHAR(36)     NOT NULL,
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (collection, old_slug),
  KEY slug_redirects_entry (entry_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
