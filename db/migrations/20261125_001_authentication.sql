CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_name_length CHECK (
    char_length(btrim(name)) BETWEEN 2 AND 100
  ),
  CONSTRAINT users_email_normalized CHECK (email = lower(btrim(email))),
  CONSTRAINT users_email_length CHECK (char_length(email) BETWEEN 3 AND 254),
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_password_hash_not_empty CHECK (length(password_hash) > 0)
);

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  identifier_hash char(64) PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  attempts integer NOT NULL CHECK (attempts > 0)
);

CREATE INDEX IF NOT EXISTS auth_rate_limits_window_started_at_idx
  ON auth_rate_limits (window_started_at);
