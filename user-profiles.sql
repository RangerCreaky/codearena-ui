CREATE TABLE user_profiles (
    username            TEXT.               UNIQUE
    user_id             UUID                PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name        TEXT                NOT NULL,
    avatar_url          TEXT,                                        -- S3/blob URL, not the image itself
    bio                 TEXT,
    country             CHAR(2),                                     -- ISO 3166 alpha-2 country code
    preferred_language  preferred_language  NOT NULL DEFAULT 'python',
    github_url          TEXT,
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);