-- Operational records required by the production CMS.

CREATE TABLE IF NOT EXISTS integration_delivery (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, idempotency_key)
);

CREATE TABLE IF NOT EXISTS translation_job (
  id BIGSERIAL PRIMARY KEY,
  version_id BIGINT NOT NULL REFERENCES news_version(id) ON DELETE CASCADE,
  target_locale TEXT NOT NULL CHECK (target_locale IN ('jp', 'hk')),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED')),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_asset (
  id TEXT PRIMARY KEY,
  article_id BIGINT REFERENCES news_article(id) ON DELETE SET NULL,
  blob_url TEXT NOT NULL,
  thumbnail_url TEXT,
  mime_type TEXT NOT NULL,
  width INTEGER NOT NULL CHECK (width > 0),
  height INTEGER NOT NULL CHECK (height > 0),
  alt_text TEXT,
  usage TEXT NOT NULL CHECK (usage IN ('COVER', 'CONTENT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS integration_delivery_external_idx
  ON integration_delivery(source, external_id);
CREATE INDEX IF NOT EXISTS translation_job_version_idx
  ON translation_job(version_id, created_at DESC);
CREATE INDEX IF NOT EXISTS cms_asset_article_idx
  ON cms_asset(article_id, usage);
