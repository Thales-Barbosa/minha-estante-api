
CREATE DATABASE IF NOT EXISTS minha_estante;


USE minha_estante;


CREATE TABLE IF NOT EXISTS livros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL
);


INSERT INTO livros (titulo, autor, status) VALUES 
('O Código Da Vinci', 'Dan Brown', 'Lido'),
('Duna', 'Frank Herbert', 'Lendo');     