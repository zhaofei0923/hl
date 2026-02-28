-- Add username field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(32) UNIQUE COMMENT '用户名，用于账号密码登录' AFTER id;

-- Add admin field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin TINYINT DEFAULT 0 COMMENT '0-normal user, 1-admin' AFTER status;

-- Create index for admin lookup
CREATE INDEX idx_is_admin ON users(is_admin);
