-- Migration: Add user certification system
-- Add certification_status to users table
ALTER TABLE users
  ADD COLUMN certification_status ENUM('none', 'pending', 'approved', 'rejected') DEFAULT 'none'
  COMMENT '实名认证状态' AFTER is_verified;

-- Create user_certifications table to store certification materials and audit trail
CREATE TABLE IF NOT EXISTS user_certifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  real_name VARCHAR(32) COMMENT '真实姓名',
  id_card VARCHAR(18) COMMENT '身份证号',
  id_front_photo VARCHAR(500) COMMENT '身份证正面（人像面）',
  id_back_photo VARCHAR(500) COMMENT '身份证反面（国徽面）',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '审核状态',
  reject_reason VARCHAR(255) COMMENT '拒绝原因',
  submitted_at DATETIME COMMENT '提交时间',
  reviewed_at DATETIME COMMENT '审核时间',
  reviewer_id BIGINT COMMENT '审核管理员 user_id',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
