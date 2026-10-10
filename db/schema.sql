-- Run once in the Neon SQL Editor for the database connected to this Vercel project.
CREATE TABLE IF NOT EXISTS gamehub_activity (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  display_name VARCHAR(32) NOT NULL CHECK (display_name ~ '^[A-Za-z0-9_]{1,32}$'),
  event_type VARCHAR(40) NOT NULL DEFAULT 'demo_sign_in',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gamehub_activity_created_at_idx
  ON gamehub_activity (created_at DESC);

CREATE TABLE IF NOT EXISTS gamehub_tasks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  display_name VARCHAR(32) NOT NULL CHECK (display_name ~ '^[A-Za-z0-9_]{1,32}$'),
  game_id VARCHAR(40) NOT NULL CHECK (game_id IN ('blox', 'rivals', 'egg', 'anime')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (display_name, game_id)
);

CREATE INDEX IF NOT EXISTS gamehub_tasks_updated_at_idx
  ON gamehub_tasks (updated_at DESC);
