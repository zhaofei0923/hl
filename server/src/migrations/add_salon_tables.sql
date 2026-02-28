-- Migration: Add salon event tables
-- Date: 2026-02-27

CREATE TABLE IF NOT EXISTS salon_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  cover_image VARCHAR(500),
  location VARCHAR(200),
  event_date DATETIME NOT NULL,
  max_participants INT DEFAULT 0,
  current_participants INT DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0.00,
  organizer_id BIGINT,
  status ENUM('upcoming','ongoing','ended','cancelled') DEFAULT 'upcoming',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS salon_registrations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  status ENUM('registered','attended','cancelled') DEFAULT 'registered',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_event_user (event_id, user_id),
  FOREIGN KEY (event_id) REFERENCES salon_events(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
