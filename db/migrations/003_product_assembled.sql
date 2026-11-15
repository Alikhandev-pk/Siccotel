-- Marks the five imported Siccotel Telecom devices as assembled locally, so /products
-- keeps them under "Assembled in Karachi". Products added in the admin without the
-- flag are listed in the catalogue section instead. Adds one field only; every other
-- field and every publish status is unchanged.
UPDATE entries
SET draft = JSON_SET(draft, '$.assembled', TRUE),
    published = CASE WHEN published IS NULL THEN NULL ELSE JSON_SET(published, '$.assembled', TRUE) END
WHERE collection = 'products' AND seed_key LIKE 'product:%';
