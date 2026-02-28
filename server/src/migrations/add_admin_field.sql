-- Add admin field to users table
ALTER TABLE users ADD COLUMN is_admin TINYINT DEFAULT 0 COMMENT '0-normal user, 1-admin' AFTER status;

-- Create index for admin lookup
CREATE INDEX idx_is_admin ON users(is_admin);
