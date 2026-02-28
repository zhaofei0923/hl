-- HL Matchmaking Platform - Database Initialization SQL
-- Run this script to create all tables

CREATE DATABASE IF NOT EXISTS hl_matchmaking DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hl_matchmaking;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(32) UNIQUE COMMENT '用户名，用于账号密码登录',
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  wechat_openid VARCHAR(128) UNIQUE,
  wechat_unionid VARCHAR(128),
  nickname VARCHAR(64),
  avatar_url VARCHAR(500),
  gender TINYINT DEFAULT 0 COMMENT '0-unknown, 1-male, 2-female',
  current_role ENUM('user', 'matchmaker') DEFAULT 'user',
  is_verified TINYINT DEFAULT 0,
  profile_completion TINYINT DEFAULT 0,
  status TINYINT DEFAULT 1 COMMENT '0-disabled, 1-active',
  last_login_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_wechat_openid (wechat_openid),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  real_name VARCHAR(32),
  birth_date DATE,
  age TINYINT UNSIGNED,
  height SMALLINT COMMENT 'Height in cm',
  weight SMALLINT COMMENT 'Weight in kg',
  education VARCHAR(32),
  occupation VARCHAR(64),
  income_range VARCHAR(32),
  province VARCHAR(32),
  city VARCHAR(32),
  district VARCHAR(32),
  native_place VARCHAR(64),
  marital_status VARCHAR(16),
  has_children TINYINT,
  want_children TINYINT,
  house_status VARCHAR(32),
  car_status VARCHAR(32),
  smoking VARCHAR(16),
  drinking VARCHAR(16),
  self_intro TEXT,
  partner_requirement TEXT,
  tags JSON,
  photos JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_city (province, city),
  INDEX idx_age (age),
  INDEX idx_gender_age (age, marital_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS codes table
CREATE TABLE IF NOT EXISTS sms_codes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  type ENUM('login', 'register', 'reset_password', 'bind_phone') NOT NULL,
  is_used TINYINT DEFAULT 0,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone_type (phone, type),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Matchmakers table
CREATE TABLE IF NOT EXISTS matchmakers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  matchmaker_no VARCHAR(32) UNIQUE,
  level TINYINT DEFAULT 1 COMMENT 'Matchmaker level 1-5',
  parent_id BIGINT,
  team_id BIGINT,
  has_store TINYINT DEFAULT 0,
  certification_status TINYINT DEFAULT 0 COMMENT '0-uncertified, 1-pending, 2-certified, 3-rejected',
  total_performance DECIMAL(12,2) DEFAULT 0.00,
  status TINYINT DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES matchmakers(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_team_id (team_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Matchmaker stores table
CREATE TABLE IF NOT EXISTS matchmaker_stores (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  matchmaker_id BIGINT NOT NULL,
  store_name VARCHAR(128),
  address VARCHAR(255),
  province VARCHAR(32),
  city VARCHAR(32),
  contact_phone VARCHAR(20),
  business_license VARCHAR(500),
  photos JSON,
  status TINYINT DEFAULT 0 COMMENT '0-pending, 1-approved, 2-rejected',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (matchmaker_id) REFERENCES matchmakers(id) ON DELETE CASCADE,
  INDEX idx_matchmaker_id (matchmaker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  leader_id BIGINT NOT NULL,
  member_count INT DEFAULT 0,
  total_performance DECIMAL(12,2) DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES matchmakers(id) ON DELETE CASCADE,
  INDEX idx_leader_id (leader_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key for matchmakers.team_id after teams table creation
ALTER TABLE matchmakers ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  matchmaker_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  member_type ENUM('free', 'member', 'manual_match', 'no_consumption') DEFAULT 'free',
  service_level VARCHAR(32),
  expire_at DATETIME,
  remark TEXT,
  status TINYINT DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (matchmaker_id) REFERENCES matchmakers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_matchmaker_user (matchmaker_id, user_id),
  INDEX idx_matchmaker_id (matchmaker_id),
  INDEX idx_user_id (user_id),
  INDEX idx_member_type (member_type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  available_amount DECIMAL(12,2) DEFAULT 0.00,
  frozen_amount DECIMAL(12,2) DEFAULT 0.00,
  total_earned DECIMAL(12,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(12,2) DEFAULT 0.00,
  xi_coins INT DEFAULT 0,
  version INT DEFAULT 0 COMMENT 'Optimistic lock version',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Earning records table
CREATE TABLE IF NOT EXISTS earning_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  type ENUM('share_earning', 'match_earning', 'team_earning', 'lifetime_earning', 'xi_coin_earning') NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0.00,
  xi_coins INT DEFAULT 0,
  source_order_id BIGINT,
  description VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Withdraw records table
CREATE TABLE IF NOT EXISTS withdraw_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  fee DECIMAL(12,2) DEFAULT 0.00,
  actual_amount DECIMAL(12,2) NOT NULL,
  withdraw_to ENUM('wechat', 'alipay', 'bank') NOT NULL,
  account_info JSON,
  status ENUM('pending', 'processing', 'success', 'failed', 'rejected') DEFAULT 'pending',
  reject_reason VARCHAR(255),
  processed_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transfer records table
CREATE TABLE IF NOT EXISTS transfer_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  from_user_id BIGINT,
  type ENUM('recharge', 'transfer', 'reward', 'refund') NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0.00,
  xi_coins INT DEFAULT 0,
  description VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(64) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  matchmaker_id BIGINT,
  type ENUM('membership', 'manual_match', 'vip_service', 'xi_coin_purchase') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0.00,
  payment_method VARCHAR(32),
  status ENUM('pending', 'paid', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
  paid_at DATETIME,
  completed_at DATETIME,
  remark VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (matchmaker_id) REFERENCES matchmakers(id) ON DELETE SET NULL,
  INDEX idx_order_no (order_no),
  INDEX idx_user_id (user_id),
  INDEX idx_matchmaker_id (matchmaker_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('private', 'system', 'service') DEFAULT 'private',
  user_a_id BIGINT NOT NULL,
  user_b_id BIGINT NOT NULL,
  last_message_id BIGINT,
  last_message_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_a_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_b_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_pair (user_a_id, user_b_id),
  INDEX idx_user_a (user_a_id),
  INDEX idx_user_b (user_b_id),
  INDEX idx_last_message_at (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT NOT NULL,
  sender_id BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  content_type ENUM('text', 'image', 'system') DEFAULT 'text',
  content TEXT NOT NULL,
  is_read TINYINT DEFAULT 0,
  read_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Match records table
CREATE TABLE IF NOT EXISTS match_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_a_id BIGINT NOT NULL,
  user_b_id BIGINT NOT NULL,
  matchmaker_id BIGINT,
  match_type ENUM('system', 'manual', 'speed') NOT NULL,
  compatibility_score TINYINT UNSIGNED,
  status ENUM('pending', 'accepted_a', 'accepted_b', 'mutual', 'rejected', 'expired') DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_a_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_b_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (matchmaker_id) REFERENCES matchmakers(id) ON DELETE SET NULL,
  INDEX idx_user_a (user_a_id),
  INDEX idx_user_b (user_b_id),
  INDEX idx_matchmaker_id (matchmaker_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  inviter_id BIGINT NOT NULL,
  invitee_id BIGINT NOT NULL UNIQUE,
  invite_code VARCHAR(32),
  reward_amount DECIMAL(12,2) DEFAULT 0.00,
  status TINYINT DEFAULT 0 COMMENT '0-pending, 1-rewarded',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_inviter_id (inviter_id),
  INDEX idx_invite_code (invite_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
