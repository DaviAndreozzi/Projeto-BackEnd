-- Active: 1685404169479@@127.0.0.1@3306
CREATE TABLE users(
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT DEFAULT(DATETIME()) NOT NULL
);

INSERT INTO users(id,name,email,password,role) 
VALUES 
('u001', 'Auqa', 'aquam@gmail.com','aqua123','NORMAL'),
('u002', 'megumin', 'megumin@gmail.com','rem123','NORMAL'),
('u003', 'Kazuma', 'kazuma@gmail.com', 'kazuma123','ADMIN');
SELECT * FROM users;
CREATE TABLE playlists(
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  creator_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  likes INTEGER DEFAULT (0) NOT NULL,
  dislikes INTEGER DEFAULT (0) NOT NULL,
  created_at TEXT DEFAULT(DATETIME()) NOT NULL,
  updated_at TEXT DEFAULT(DATETIME()) NOT NULL,
  Foreign Key (creator_id) REFERENCES users(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE
);


INSERT INTO playlists (id,creator_id,name)
VALUES
('p001', 'u001', 'relaxing'),
('p002', 'u002', 'Classic');

SELECT * FROM playlists;

CREATE TABLE likes_dislikes(
  user_id TEXT NOT NULL,
  playlist_id TEXT NOT NULL,
  like INTEGER NOT NULL,
  Foreign Key (user_id) REFERENCES users(id),
  Foreign Key (playlist_id) REFERENCES playlists(id)
);

INSERT INTO likes_dislikes (user_id,playlist_id,like)
VALUES
('u001','p001',1),
('u003','p001',1),
('u001','p002',1),
('u003','p002',0);

SELECT * FROM likes_dislikes;

UPDATE playlists
SET likes = 2
WHERE id = 'p001';

UPDATE playlists
SET likes = 1, dislikes=1 
WHERE id = 'p002';





-- Queries de deleção abaixo:
DROP TABLE likes_dislikes;
DROP TABLE playlists;
DROP TABLE users;