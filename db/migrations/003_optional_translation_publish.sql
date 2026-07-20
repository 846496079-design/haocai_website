-- Separate the current draft translation state from published locale visibility.

ALTER TABLE news_article
  ADD COLUMN IF NOT EXISTS published_locales_complete BOOLEAN;

UPDATE news_article
SET published_locales_complete = (status = 'PUBLISHED' AND published_version_id IS NOT NULL)
WHERE published_locales_complete IS NULL;

ALTER TABLE news_article
  ALTER COLUMN published_locales_complete SET DEFAULT FALSE;

ALTER TABLE news_article
  ALTER COLUMN published_locales_complete SET NOT NULL;
