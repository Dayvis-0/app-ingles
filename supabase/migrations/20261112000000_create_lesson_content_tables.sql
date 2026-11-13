-- ==============================================================================
-- MIGRACIÓN HU04: Tablas de contenido de lecciones
-- Autor: Yunior
-- Descripción: vocabulario, gramática, construcciones, pronunciación y preguntas
-- Depende de: 20261012000000_create_users_students_lessons.sql (tabla leccion)
-- ==============================================================================

-- 1. Vocabulario de la lección
CREATE TABLE IF NOT EXISTS vocabulario (
    id_vocabulario      SERIAL PRIMARY KEY,
    id_leccion          TEXT NOT NULL,
    palabra_ingles      VARCHAR(100) NOT NULL,
    traduccion_espanol  VARCHAR(100) NOT NULL,
    url_audio           VARCHAR(500),
    orden               SMALLINT NOT NULL CHECK (orden > 0),
    CONSTRAINT fk_vocabulario_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion) ON DELETE CASCADE,
    CONSTRAINT uq_vocabulario_orden UNIQUE (id_leccion, orden)
);

-- 2. Gramática de la lección (una por lección)
CREATE TABLE IF NOT EXISTS gramatica (
    id_gramatica        SERIAL PRIMARY KEY,
    id_leccion          TEXT NOT NULL UNIQUE,
    nombre_tema         VARCHAR(150) NOT NULL,
    explicacion         TEXT NOT NULL,
    formula             VARCHAR(100),
    ejemplo             TEXT,
    gramatica_columnas  JSONB NOT NULL DEFAULT '[]'::jsonb,
    ejemplo_roles       TEXT[] NOT NULL DEFAULT '{}',
    CONSTRAINT fk_gramatica_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion) ON DELETE CASCADE
);

-- 3. Construcciones de oraciones (traducción guiada)
CREATE TABLE IF NOT EXISTS construccion_oracion (
    id_construccion     SERIAL PRIMARY KEY,
    id_leccion          TEXT NOT NULL,
    oracion_espanol     TEXT NOT NULL,
    respuesta_correcta  TEXT NOT NULL,
    orden               SMALLINT NOT NULL CHECK (orden > 0),
    CONSTRAINT fk_construccion_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion) ON DELETE CASCADE,
    CONSTRAINT uq_construccion_orden UNIQUE (id_leccion, orden)
);

-- 3.1 Palabras que componen cada construcción (orden correcto)
CREATE TABLE IF NOT EXISTS palabra_construccion (
    id_palabra          SERIAL PRIMARY KEY,
    id_construccion     INT NOT NULL,
    palabra             VARCHAR(100) NOT NULL,
    orden_correcto      SMALLINT NOT NULL CHECK (orden_correcto > 0),
    CONSTRAINT fk_palabra_construccion FOREIGN KEY (id_construccion)
        REFERENCES construccion_oracion(id_construccion) ON DELETE CASCADE,
    CONSTRAINT uq_palabra_orden UNIQUE (id_construccion, orden_correcto)
);

-- 4. Pronunciación de la lección
CREATE TABLE IF NOT EXISTS pronunciacion (
    id_pronunciacion    SERIAL PRIMARY KEY,
    id_leccion          TEXT NOT NULL,
    oracion_ingles      TEXT NOT NULL,
    orden               SMALLINT NOT NULL CHECK (orden > 0),
    CONSTRAINT fk_pronunciacion_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion) ON DELETE CASCADE,
    CONSTRAINT uq_pronunciacion_orden UNIQUE (id_leccion, orden)
);

-- 5. Evaluación de la lección (contenedor de preguntas, una por lección)
CREATE TABLE IF NOT EXISTS evaluacion (
    id_evaluacion       SERIAL PRIMARY KEY,
    id_leccion          TEXT NOT NULL UNIQUE,
    CONSTRAINT fk_evaluacion_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion) ON DELETE CASCADE
);

-- 5.1 Preguntas de selección múltiple de la evaluación
CREATE TABLE IF NOT EXISTS pregunta (
    id_pregunta         SERIAL PRIMARY KEY,
    id_evaluacion       INT NOT NULL,
    enunciado           TEXT NOT NULL,
    alternativa_a       VARCHAR(100) NOT NULL,
    alternativa_b       VARCHAR(100) NOT NULL,
    alternativa_c       VARCHAR(100) NOT NULL,
    alternativa_d       VARCHAR(100) NOT NULL,
    respuesta_correcta  CHAR(1) NOT NULL
        CHECK (respuesta_correcta IN ('A', 'B', 'C', 'D')),
    orden               SMALLINT NOT NULL CHECK (orden > 0),
    CONSTRAINT fk_pregunta_evaluacion FOREIGN KEY (id_evaluacion)
        REFERENCES evaluacion(id_evaluacion) ON DELETE CASCADE,
    CONSTRAINT uq_pregunta_orden UNIQUE (id_evaluacion, orden)
);

-- ==============================================================================
-- Índices para acelerar las consultas por lección / evaluación
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_vocabulario_leccion ON vocabulario(id_leccion);
CREATE INDEX IF NOT EXISTS idx_gramatica_leccion ON gramatica(id_leccion);
CREATE INDEX IF NOT EXISTS idx_construccion_leccion ON construccion_oracion(id_leccion);
CREATE INDEX IF NOT EXISTS idx_palabra_construccion ON palabra_construccion(id_construccion);
CREATE INDEX IF NOT EXISTS idx_pronunciacion_leccion ON pronunciacion(id_leccion);
CREATE INDEX IF NOT EXISTS idx_evaluacion_leccion ON evaluacion(id_leccion);
CREATE INDEX IF NOT EXISTS idx_pregunta_evaluacion ON pregunta(id_evaluacion);

-- ==============================================================================
-- RLS desactivado (flujo acordado para el proyecto, igual que la migración HU01)
-- ==============================================================================
ALTER TABLE vocabulario DISABLE ROW LEVEL SECURITY;
ALTER TABLE gramatica DISABLE ROW LEVEL SECURITY;
ALTER TABLE construccion_oracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE palabra_construccion DISABLE ROW LEVEL SECURITY;
ALTER TABLE pronunciacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE pregunta DISABLE ROW LEVEL SECURITY;
