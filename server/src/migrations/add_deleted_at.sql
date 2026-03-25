-- Add soft-delete support (deleted_at) to users and matchmakers tables
-- Run: mysql -u root -p hl_db < server/src/migrations/add_deleted_at.sql

ALTER TABLE users ADD COLUMN deleted_at DATETIME DEFAULT NULL AFTER updated_at;
ALTER TABLE matchmakers ADD COLUMN deleted_at DATETIME DEFAULT NULL AFTER updated_at;

CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_matchmakers_deleted_at ON matchmakers(deleted_at);
