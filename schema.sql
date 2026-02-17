DROP TABLE IF EXISTS reflections;
DROP TABLE IF EXISTS evaluations;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS folders;
DROP TABLE IF EXISTS cohorts;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('participant', 'instructor', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cohorts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  term TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  cohort_id TEXT,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (cohort_id) REFERENCES cohorts(id)
);

CREATE TABLE files (
  id TEXT PRIMARY KEY,
  folder_id TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  metadata TEXT, -- JSON string for extra metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES folders(id)
);

CREATE TABLE evaluations (
  id TEXT PRIMARY KEY,
  folder_id TEXT NOT NULL,
  instructor_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  comments TEXT,
  attachment_key TEXT,
  attachment_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES folders(id),
  FOREIGN KEY (instructor_id) REFERENCES users(id)
);

CREATE TABLE reflections (
  id TEXT PRIMARY KEY,
  folder_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES folders(id)
);

-- Seed Data (For testing)
INSERT INTO users (id, name, email, role) VALUES ('u1', 'Alice Participant', 'alice@example.com', 'participant');
INSERT INTO users (id, name, email, role) VALUES ('u2', 'Bob Instructor', 'bob@example.com', 'instructor');
INSERT INTO cohorts (id, name, term) VALUES ('c1', 'Summer 2026', '2026-S');
