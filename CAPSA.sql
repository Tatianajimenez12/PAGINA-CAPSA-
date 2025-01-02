-- Crear la base de datos
CREATE DATABASE CAPSA;
USE CAPSA;

-- Crear tabla 'servicio'
CREATE TABLE servicio (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion VARCHAR(255)
);

-- Crear tabla 'paquete_servicio'
CREATE TABLE paquete_servicio (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  servicio_id BIGINT NOT NULL,
  numero_paquete INT NOT NULL,
  descripcion VARCHAR(255),
  costo DECIMAL(10,2) NOT NULL,
  disponibilidad BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (servicio_id) REFERENCES servicio(id)
);

-- Crear tabla 'cliente'
CREATE TABLE cliente (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  correo_electronico VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL
);

-- Crear tabla 'formulario_contacto'
CREATE TABLE formulario_contacto (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT NOT NULL,
  asunto VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

-- Crear tabla 'paciente'
CREATE TABLE paciente (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  edad INT NOT NULL,
  genero VARCHAR(50) NOT NULL,
  condicion_medica VARCHAR(255) NOT NULL,
  direccion TEXT NOT NULL,
  alergias TEXT,
  medicacion_actual TEXT
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Crear tabla 'contrato'
CREATE TABLE contrato (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT NOT NULL,
  paquete_servicio_id BIGINT NOT NULL,
  paciente_id BIGINT NOT NULL,
  fecha_contrato TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  FOREIGN KEY (paquete_servicio_id) REFERENCES paquete_servicio(id),
  FOREIGN KEY (paciente_id) REFERENCES paciente(id)
);

CREATE TABLE quejas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    apellidos VARCHAR(50),
    email VARCHAR(100),
    telefono VARCHAR(15),
    preferencia_contacto VARCHAR(10),
    servicio_contratado VARCHAR(100),
    problema_area VARCHAR(20),
    especialista VARCHAR(50),
    fecha DATE,
    horario TIME,
    descripcion TEXT
);

CREATE TABLE postulaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    correo VARCHAR(255),
    telefono VARCHAR(50),
    direccion VARCHAR(255),
    especialidad VARCHAR(100),
    horarios TEXT,
    cv VARCHAR(255),
    cedula VARCHAR(255),
    referencias VARCHAR(255),
    fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


GRANT ALL PRIVILEGES ON CAPSA.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';

SELECT * FROM cliente;
ALTER TABLE cliente MODIFY servicio VARCHAR(50)  NOT NULL;
ALTER TABLE cliente MODIFY comunicacion VARCHAR(20)  NOT NULL;
ALTER TABLE cliente MODIFY dudas TEXT;




ALTER TABLE usuarios ADD COLUMN resetPasswordToken VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN resetPasswordExpires DATETIME; 
DROP TABLE IF EXISTS cliente;
SELECT * FROM usuarios;
SELECT * FROM cliente;


