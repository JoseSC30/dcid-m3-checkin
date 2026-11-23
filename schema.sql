CREATE TABLE
    IF NOT EXISTS checkins (
        id BIGSERIAL PRIMARY KEY,
        code UUID NOT NULL UNIQUE,
        event_id BIGINT NOT NULL,
        porter_id BIGINT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
    );