USE LHYS;

CREATE TABLE IF NOT EXISTS personal_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_user_id BIGINT NOT NULL,
  real_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  avatar_url VARCHAR(500),
  headline VARCHAR(200),
  location VARCHAR(100),
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_personal_profiles_admin_user UNIQUE (admin_user_id),
  CONSTRAINT fk_personal_profiles_admin_user
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profile_introductions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  profile_id BIGINT NOT NULL,
  introduction TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_profile_introductions_profile UNIQUE (profile_id),
  CONSTRAINT fk_profile_introductions_profile
    FOREIGN KEY (profile_id) REFERENCES personal_profiles(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profile_skills (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  profile_id BIGINT NOT NULL,
  skills_text TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_profile_skills_profile UNIQUE (profile_id),
  CONSTRAINT fk_profile_skills_profile
    FOREIGN KEY (profile_id) REFERENCES personal_profiles(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profile_skill_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  profile_id BIGINT NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  skill_description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_skill_items_profile
    FOREIGN KEY (profile_id) REFERENCES personal_profiles(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_profile_skill_items_profile_sort
  ON profile_skill_items (profile_id, sort_order);

CREATE TABLE IF NOT EXISTS project_experiences (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  profile_id BIGINT NOT NULL,
  project_name VARCHAR(200) NOT NULL,
  period_text VARCHAR(100),
  start_date DATE,
  end_date DATE,
  project_summary TEXT,
  role_description TEXT,
  personal_contribution TEXT,
  repository_url VARCHAR(500),
  sort_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_project_experiences_profile
    FOREIGN KEY (profile_id) REFERENCES personal_profiles(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_project_experiences_profile_sort
  ON project_experiences (profile_id, sort_order);

CREATE TABLE IF NOT EXISTS project_links (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  link_name VARCHAR(100) NOT NULL,
  link_url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_project_links_project
    FOREIGN KEY (project_id) REFERENCES project_experiences(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_project_links_project_sort
  ON project_links (project_id, sort_order);

CREATE TABLE IF NOT EXISTS honor_awards (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  profile_id BIGINT NOT NULL,
  award_name VARCHAR(200) NOT NULL,
  awarded_date DATE,
  award_level VARCHAR(100),
  certificate_pdf_url VARCHAR(500),
  sort_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_honor_awards_profile
    FOREIGN KEY (profile_id) REFERENCES personal_profiles(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_honor_awards_profile_sort
  ON honor_awards (profile_id, sort_order);

CREATE TABLE IF NOT EXISTS work_experiences (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  profile_id BIGINT NOT NULL,
  organization VARCHAR(200) NOT NULL,
  position_title VARCHAR(150),
  period_text VARCHAR(100),
  start_date DATE,
  end_date DATE,
  work_content TEXT,
  achievements TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_work_experiences_profile
    FOREIGN KEY (profile_id) REFERENCES personal_profiles(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_work_experiences_profile_sort
  ON work_experiences (profile_id, sort_order);

CREATE TABLE IF NOT EXISTS portfolio_links (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  profile_id BIGINT NOT NULL,
  link_name VARCHAR(100) NOT NULL,
  link_url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_portfolio_links_profile
    FOREIGN KEY (profile_id) REFERENCES personal_profiles(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_portfolio_links_profile_sort
  ON portfolio_links (profile_id, sort_order);
