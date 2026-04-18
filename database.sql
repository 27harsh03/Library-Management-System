CREATE DATABASE IF NOT EXISTS mpstme_library;
USE mpstme_library;


-- enumeration allows only fixed value in the given list
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    phone       VARCHAR(20),
    password    VARCHAR(255)  NOT NULL,
    age         INT,
    role        ENUM('student','teacher','admin') DEFAULT 'student',
    joined      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    sap_id      VARCHAR(20) NOT NULL UNIQUE,
    course      VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS teachers (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    sap_id      VARCHAR(20) NOT NULL UNIQUE,
    department  VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS authors (
    author_id   INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS publishers (
    publisher_id INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    code         VARCHAR(20)  NOT NULL UNIQUE,
    title        VARCHAR(200) NOT NULL,
    subject      VARCHAR(100),
    rating       DECIMAL(2,1) DEFAULT 0.0,
    author_id    INT,
    publisher_id INT,
    added_on     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES authors(author_id),
    FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id)
);

CREATE TABLE IF NOT EXISTS cart (
    cart_id     INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    book_id     INT NOT NULL,
    added_on    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE IF NOT EXISTS checkout (
    checkout_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    book_id       INT NOT NULL,
    checkout_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    return_date   DATE,
    returned      BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    review_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    book_id     INT NOT NULL,
    rating      INT NOT NULL,
    review_text TEXT,
    created_on  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

-- add some predetrmine value in the table
INSERT IGNORE INTO users (name, email, phone, password, age, role)
VALUES ('Admin', 'admin@mpstme.ac.in', '9999999999', 'admin123', 30, 'admin');

INSERT IGNORE INTO authors (name) VALUES
('Cormen'), ('Silberschatz'), ('Tanenbaum'), ('Forouzan'), ('Pressman');

INSERT IGNORE INTO publishers (name) VALUES
('MIT Press'), ('McGraw Hill'), ('Pearson'), ('Wiley');

INSERT IGNORE INTO books (code, title, subject, author_id, publisher_id) VALUES
('B001', 'Introduction to Algorithms',  'Computer Science', 1, 1),
('B002', 'Database System Concepts',    'Information Tech', 2, 2),
('B003', 'Operating System Concepts',   'Computer Science', 2, 2),
('B004', 'Computer Networks',           'Networking',       3, 3),
('B005', 'Data Communications',         'Networking',       4, 3),
('B006', 'Software Engineering',        'Engineering',      5, 4);



SELECT
    u.name          AS user_name,
    u.email         AS user_email,
    u.role          AS user_role,
    b.code          AS book_code,
    b.title         AS book_title,
    b.subject       AS book_subject,
    a.name          AS author_name,
    c.checkout_date,
    c.return_date,
    c.returned
FROM checkout c
INNER JOIN users   u  ON c.user_id   = u.id            
INNER JOIN books   b  ON c.book_id   = b.id            
INNER JOIN authors a  ON b.author_id = a.author_id     
ORDER BY c.checkout_date DESC;

