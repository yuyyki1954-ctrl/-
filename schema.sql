DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

DROP TABLE IF EXISTS files;
CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  filename TEXT,
  data BLOB,
  size INTEGER,
  uploaded_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

DROP TABLE IF EXISTS feedback;
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  content TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
