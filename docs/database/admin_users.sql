CREATE DATABASE IF NOT EXISTS LHYS
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE LHYS;

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_admin_users_username UNIQUE (username),
  CONSTRAINT uk_admin_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_admin_users_enabled ON admin_users (enabled);

-- Do not store plaintext passwords.
-- Use the admin creation page or API so the backend writes a BCrypt password_hash.
