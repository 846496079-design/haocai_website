-- CMS production schema for Neon PostgreSQL.
-- This mirrors the local SQLite structure and is intentionally idempotent.

CREATE TABLE IF NOT EXISTS cms_admin (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_session (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT NOT NULL REFERENCES cms_admin(id),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_category (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
  source TEXT NOT NULL DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'IMPORT')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_article (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'OFFLINE', 'TRASH')),
  published_version_id BIGINT,
  draft_version_id BIGINT,
  category_id BIGINT REFERENCES news_category(id),
  published_at TIMESTAMPTZ,
  offline_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  deleted_from_status TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  pinned_position DOUBLE PRECISION,
  manual_position DOUBLE PRECISION,
  translation_status TEXT NOT NULL DEFAULT 'NOT_TRANSLATED' CHECK (translation_status IN ('CURRENT', 'STALE', 'NOT_TRANSLATED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_version (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES news_article(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL,
  state TEXT NOT NULL,
  content_json JSONB NOT NULL,
  previewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(article_id, version_no)
);

CREATE TABLE IF NOT EXISTS cms_audit_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  detail_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS news_article_status_sort_idx ON news_article(status, is_pinned DESC, pinned_position, manual_position, published_at DESC);
CREATE INDEX IF NOT EXISTS cms_session_token_idx ON cms_session(token_hash);
CREATE INDEX IF NOT EXISTS news_version_article_idx ON news_version(article_id, version_no DESC);
