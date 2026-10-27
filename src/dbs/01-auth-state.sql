CREATE TABLE IF NOT EXISTS auth_state (
    state UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_verifier TEXT NOT NULL
);
