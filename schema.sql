DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
