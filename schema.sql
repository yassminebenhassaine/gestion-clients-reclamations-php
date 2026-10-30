CREATE DATABASE IF NOT EXISTS gestion_reclamations CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestion_reclamations;

CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(80) NOT NULL,
  prenom VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  telephone VARCHAR(20),
  adresse VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS reclamations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  objet VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  statut ENUM('Ouverte','En cours','Résolue','Clôturée') NOT NULL DEFAULT 'Ouverte',
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
