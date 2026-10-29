SET search_path TO etapa_productiva;

DO $$ BEGIN
  CREATE TYPE estado_carta_presentacion_t AS ENUM ('CARGADA', 'APROBADA', 'RECHAZADA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS cartas_presentacion (
    id              BIGSERIAL PRIMARY KEY,
    proceso_id      BIGINT NOT NULL
                    REFERENCES procesos_etapa_productiva(id) ON DELETE CASCADE,
    coordinador_id  BIGINT NOT NULL
                    REFERENCES usuarios(id),
    archivo_url     VARCHAR(500) NOT NULL,
    nombre_archivo  VARCHAR(255),
    tamano_bytes    BIGINT,
    estado          estado_carta_presentacion_t NOT NULL DEFAULT 'CARGADA',
    observaciones   TEXT,
    fecha_carga     TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_aprobacion TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cartas_proceso ON cartas_presentacion(proceso_id);
CREATE INDEX IF NOT EXISTS idx_cartas_coordinador ON cartas_presentacion(coordinador_id);
