-- Timestamps are UTC from now on: every app connection sets time_zone = '+00:00'
-- (src/lib/cms/db.ts), matching the UTC values the app already wrote on updates.
--
-- Earlier, column defaults (CURRENT_TIMESTAMP) used the server's local zone, so rows
-- created by defaults are ahead of UTC by the zone offset and sit in the future
-- relative to UTC. Shift only those back. Content is not touched. No-op on servers
-- already running in UTC or west of it.
SET @offset_seconds = TIMESTAMPDIFF(SECOND, UTC_TIMESTAMP(), NOW());

UPDATE entries SET updated_at = updated_at - INTERVAL @offset_seconds SECOND
  WHERE @offset_seconds > 0 AND updated_at > UTC_TIMESTAMP(3);
UPDATE entries SET published_at = published_at - INTERVAL @offset_seconds SECOND
  WHERE @offset_seconds > 0 AND published_at > UTC_TIMESTAMP(3);
UPDATE entries SET deleted_at = deleted_at - INTERVAL @offset_seconds SECOND
  WHERE @offset_seconds > 0 AND deleted_at > UTC_TIMESTAMP(3);
UPDATE documents SET updated_at = updated_at - INTERVAL @offset_seconds SECOND
  WHERE @offset_seconds > 0 AND updated_at > UTC_TIMESTAMP(3);
UPDATE documents SET published_at = published_at - INTERVAL @offset_seconds SECOND
  WHERE @offset_seconds > 0 AND published_at > UTC_TIMESTAMP(3);
UPDATE media_assets SET created_at = created_at - INTERVAL @offset_seconds SECOND
  WHERE @offset_seconds > 0 AND created_at > UTC_TIMESTAMP(3);
UPDATE admins SET created_at = created_at - INTERVAL @offset_seconds SECOND
  WHERE @offset_seconds > 0 AND created_at > UTC_TIMESTAMP(3);
UPDATE slug_redirects SET created_at = created_at - INTERVAL @offset_seconds SECOND
  WHERE @offset_seconds > 0 AND created_at > UTC_TIMESTAMP(3);
