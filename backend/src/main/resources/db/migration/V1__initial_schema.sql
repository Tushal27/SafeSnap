-- V1: Initial SafeSnap schema
-- All timestamps stored as UTC in TIMESTAMPTZ.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------ parents --
CREATE TABLE parents (
    id            UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email         VARCHAR(320) NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_parent_email UNIQUE (email)
);

CREATE INDEX idx_parent_email ON parents (email);

-- ----------------------------------------------------------------- children --
CREATE TABLE children (
    id          UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    device_name VARCHAR(128) NOT NULL,
    device_id   VARCHAR(256) NOT NULL,
    parent_id   UUID         NOT NULL REFERENCES parents (id) ON DELETE CASCADE,
    paired_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ,
    is_online   BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_child_device_id UNIQUE (device_id)
);

CREATE INDEX idx_child_device_id ON children (device_id);
CREATE INDEX idx_child_parent_id ON children (parent_id);

-- ------------------------------------------------------------------- alerts --
CREATE TYPE alert_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE alerts (
    id               UUID           NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id         UUID           NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    timestamp        TIMESTAMPTZ    NOT NULL,
    severity_score   DOUBLE PRECISION NOT NULL CHECK (severity_score >= 0.0 AND severity_score <= 1.0),
    image_hash       CHAR(64)       NOT NULL,
    severity         alert_severity NOT NULL,
    acknowledged     BOOLEAN        NOT NULL DEFAULT FALSE,
    acknowledged_at  TIMESTAMPTZ
);

CREATE INDEX idx_alert_child_id  ON alerts (child_id);
CREATE INDEX idx_alert_timestamp ON alerts (timestamp DESC);
CREATE INDEX idx_alert_severity  ON alerts (severity);
CREATE INDEX idx_alert_ack       ON alerts (acknowledged);
