-- ==============================================================================
-- MIGRACIÓN HU01: Creación de tablas de usuarios, estudiantes y lecciones
-- Autor: Yunior
-- Descripción: Estructura base para autenticación interna y gestión de lecciones
-- ==============================================================================

-- 1. Tabla: usuario (base común para docentes y estudiantes)
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario      SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    nombre_usuario  VARCHAR(50) UNIQUE NOT NULL,
    contrasena      VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla: docente (rol docente vinculado al usuario)
CREATE TABLE IF NOT EXISTS docente (
    id_docente  SERIAL PRIMARY KEY,
    id_usuario  INT NOT NULL UNIQUE,
    CONSTRAINT fk_docente_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- 3. Tabla: estudiante (rol estudiante vinculado al usuario)
CREATE TABLE IF NOT EXISTS estudiante (
    id_estudiante SERIAL PRIMARY KEY,
    id_usuario    INT NOT NULL UNIQUE,
    CONSTRAINT fk_estudiante_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- 4. Tabla: leccion (lecciones creadas por el docente)
CREATE TABLE IF NOT EXISTS leccion (
    id_leccion     TEXT PRIMARY KEY,
    id_docente     INT NOT NULL,
    titulo         VARCHAR(150) NOT NULL,
    estado_activo  BOOLEAN DEFAULT FALSE,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_leccion_docente FOREIGN KEY (id_docente)
        REFERENCES docente(id_docente) ON DELETE CASCADE
);

-- ==============================================================================
-- Índices para optimizar búsquedas por usuario y docente
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_usuario_nombre_usuario ON usuario(nombre_usuario);
CREATE INDEX IF NOT EXISTS idx_leccion_docente ON leccion(id_docente);
CREATE INDEX IF NOT EXISTS idx_leccion_estado ON leccion(estado_activo);

-- ==============================================================================
-- Desactivación de RLS para el flujo acordado en el proyecto
-- ==============================================================================
ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;
ALTER TABLE docente DISABLE ROW LEVEL SECURITY;
ALTER TABLE estudiante DISABLE ROW LEVEL SECURITY;
ALTER TABLE leccion DISABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- Datos semilla iniciales para pruebas del Sprint 1
-- ==============================================================================
INSERT INTO usuario (nombre_completo, nombre_usuario, contrasena) VALUES
('Docente de Inglés', 'docente', '1234'),
('Estudiante de Prueba', 'estudiante', '1234')
ON CONFLICT (nombre_usuario) DO NOTHING;

INSERT INTO docente (id_usuario)
SELECT id_usuario FROM usuario WHERE nombre_usuario = 'docente'
ON CONFLICT (id_usuario) DO NOTHING;

INSERT INTO estudiante (id_usuario)
SELECT id_usuario FROM usuario WHERE nombre_usuario = 'estudiante'
ON CONFLICT (id_usuario) DO NOTHING;
