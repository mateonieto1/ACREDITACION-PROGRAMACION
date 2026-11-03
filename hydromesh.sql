-- 1.creae base de datos
CREATE DATABASE IF NOT EXISTS hydromesh;
USE hydromesh;

-- 2.tabla administradores (credenciales para el panel de administracion) 
CREATE TABLE administradores (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    rol VARCHAR(50) DEFAULT 'Socio Fundador'
);

-- 3.tabla historial de acceso(relacionada con administradores)
CREATE TABLE historial_accesos (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NOT NULL,
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_admin) REFERENCES administradores(id_admin) ON DELETE CASCADE
);

-- 4.tabla servicios (listado de soluciones de la empresa)
CREATE TABLE servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    codigo_frontend VARCHAR(50) UNIQUE NOT NULL,
    nombre_servicio VARCHAR(100) NOT NULL
);

-- 5.tabla consultas (tickets del formulariio relacionada con servicios)
CREATE TABLE consultas (
    id_consulta INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cliente VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(50),
    asunto VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    id_servicio INT,
    estado ENUM('no leída', 'leída') DEFAULT 'no leída',
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE SET NULL
);

-- datos iniciales (para las pruebas del backend y frontend)


-- usuario administrador por defecto
INSERT INTO administradores (usuario, password, nombre_completo) 
VALUES ('mateo.nieto', 'admin123', 'Mateo Nieto'); 

--servicios ofrecidos
INSERT INTO servicios (codigo_frontend, nombre_servicio) VALUES 
('inmersion', 'Refrigeración por Inmersión'),
('redes', 'Tendido de Redes / Fibra Óptica'),
('backups', 'Backups / Contingencia'),
('otra', 'Otra consulta general');

-- consulta de prueba
INSERT INTO consultas (nombre_cliente, email, telefono, asunto, mensaje, id_servicio, estado) 
VALUES (
    'Colegio Pcial. Dr. Ernesto Guevara', 
    'direccion@colegioguevara.edu.ar', 
    '2964-112233', 
    'Problemas de sobrecalentamiento', 
    'Necesitamos sumergir nuestros servidores porque en verano se apagan por el calor y perdemos datos.', 
    1, 
    'no leída'
);