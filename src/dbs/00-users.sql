CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    secret VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    expires_at DATE NOT NULL,
    refresh_token TEXT NOT NULL,
    trakt_uuid TEXT UNIQUE NOT NULL
);
