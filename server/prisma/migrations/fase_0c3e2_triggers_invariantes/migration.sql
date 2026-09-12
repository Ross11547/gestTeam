-- Trigger functions to enforce academic model invariants at the database level.
-- They only validate when the new structural fields are populated, preserving legacy compatibility.

CREATE OR REPLACE FUNCTION fn_hito_proyecto_periodo_coherence()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."proyectoPeriodoId" IS NOT NULL AND NEW."hitoPeriodoId" IS NOT NULL THEN
        IF (SELECT "periodoId" FROM "HitoPeriodo" WHERE id = NEW."hitoPeriodoId")
           IS DISTINCT FROM
           (SELECT "periodoId" FROM "ProyectoPeriodo" WHERE id = NEW."proyectoPeriodoId") THEN
            RAISE EXCEPTION 'HitoProyecto: hitoPeriodo no pertenece al periodo del proyectoPeriodo';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_proyecto_materia_context_coherence()
RETURNS TRIGGER AS $$
DECLARE
    v_pp_proyecto_id INT;
    v_pp_periodo_id INT;
BEGIN
    IF NEW."proyectoPeriodoId" IS NOT NULL THEN
        SELECT "proyectoId", "periodoId" INTO v_pp_proyecto_id, v_pp_periodo_id
        FROM "ProyectoPeriodo" WHERE id = NEW."proyectoPeriodoId";

        IF NEW."proyectoId" IS DISTINCT FROM v_pp_proyecto_id THEN
            RAISE EXCEPTION 'ProyectoMateria: proyectoId no coincide con proyectoPeriodo.proyectoId';
        END IF;
        IF NEW."periodoId" IS DISTINCT FROM v_pp_periodo_id THEN
            RAISE EXCEPTION 'ProyectoMateria: periodoId no coincide con proyectoPeriodo.periodoId';
        END IF;
    END IF;

    IF NEW."claseId" IS NOT NULL THEN
        IF (SELECT "materiaId" FROM "ClaseMateria" WHERE id = NEW."claseId") IS DISTINCT FROM NEW."materiaId" THEN
            RAISE EXCEPTION 'ProyectoMateria: clase no corresponde a la materia';
        END IF;
        IF (SELECT "periodoId" FROM "ClaseMateria" WHERE id = NEW."claseId") IS DISTINCT FROM NEW."periodoId" THEN
            RAISE EXCEPTION 'ProyectoMateria: clase no corresponde al periodo';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_equipo_context_coherence()
RETURNS TRIGGER AS $$
DECLARE
    v_pp_proyecto_id INT;
    v_pp_periodo_id INT;
    v_pm_proyecto_periodo_id INT;
    v_pm_materia_id INT;
    v_pm_clase_id INT;
BEGIN
    IF NEW."proyectoPeriodoId" IS NOT NULL THEN
        SELECT "proyectoId", "periodoId" INTO v_pp_proyecto_id, v_pp_periodo_id
        FROM "ProyectoPeriodo" WHERE id = NEW."proyectoPeriodoId";

        IF NEW."proyectoId" IS DISTINCT FROM v_pp_proyecto_id THEN
            RAISE EXCEPTION 'Equipo: proyectoId no coincide con proyectoPeriodo.proyectoId';
        END IF;
        IF NEW."periodoId" IS DISTINCT FROM v_pp_periodo_id THEN
            RAISE EXCEPTION 'Equipo: periodoId no coincide con proyectoPeriodo.periodoId';
        END IF;
    END IF;

    IF NEW."proyectoMateriaId" IS NOT NULL THEN
        SELECT "proyectoPeriodoId", "materiaId", "claseId"
        INTO v_pm_proyecto_periodo_id, v_pm_materia_id, v_pm_clase_id
        FROM "ProyectoMateria" WHERE id = NEW."proyectoMateriaId";

        IF NEW."proyectoPeriodoId" IS DISTINCT FROM v_pm_proyecto_periodo_id THEN
            RAISE EXCEPTION 'Equipo: proyectoMateria no pertenece al proyectoPeriodo';
        END IF;
        IF NEW."materiaId" IS DISTINCT FROM v_pm_materia_id THEN
            RAISE EXCEPTION 'Equipo: materiaId no coincide con proyectoMateria.materiaId';
        END IF;
        IF NEW."claseId" IS DISTINCT FROM v_pm_clase_id THEN
            RAISE EXCEPTION 'Equipo: claseId no coincide con proyectoMateria.claseId';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_entrega_hito_context_coherence()
RETURNS TRIGGER AS $$
DECLARE
    v_equipo_proyecto_id INT;
    v_equipo_pp_id INT;
    v_hito_proyecto_id INT;
    v_hito_pp_id INT;
BEGIN
    SELECT "proyectoId", "proyectoPeriodoId" INTO v_equipo_proyecto_id, v_equipo_pp_id
    FROM "Equipo" WHERE id = NEW."equipoId";

    SELECT "proyectoId", "proyectoPeriodoId" INTO v_hito_proyecto_id, v_hito_pp_id
    FROM "HitoProyecto" WHERE id = NEW."hitoId";

    IF v_equipo_proyecto_id IS DISTINCT FROM v_hito_proyecto_id THEN
        RAISE EXCEPTION 'EntregaHito: equipo y hito no pertenecen al mismo proyecto';
    END IF;

    IF v_equipo_pp_id IS NOT NULL AND v_hito_pp_id IS NOT NULL
       AND v_equipo_pp_id IS DISTINCT FROM v_hito_pp_id THEN
        RAISE EXCEPTION 'EntregaHito: equipo y hito no pertenecen al mismo periodo operativo';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_evaluacion_hito_context_coherence()
RETURNS TRIGGER AS $$
DECLARE
    v_hito_pp_id INT;
    v_pm_pp_id INT;
BEGIN
    SELECT "proyectoPeriodoId" INTO v_hito_pp_id
    FROM "HitoProyecto" WHERE id = NEW."hitoProyectoId";

    SELECT "proyectoPeriodoId" INTO v_pm_pp_id
    FROM "ProyectoMateria" WHERE id = NEW."proyectoMateriaId";

    IF v_hito_pp_id IS DISTINCT FROM v_pm_pp_id THEN
        RAISE EXCEPTION 'EvaluacionHito: hitoProyecto y proyectoMateria no pertenecen al mismo proyectoPeriodo';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hito_proyecto_periodo_coherence ON "HitoProyecto";
CREATE TRIGGER trg_hito_proyecto_periodo_coherence
BEFORE INSERT OR UPDATE ON "HitoProyecto"
FOR EACH ROW EXECUTE FUNCTION fn_hito_proyecto_periodo_coherence();

DROP TRIGGER IF EXISTS trg_proyecto_materia_context_coherence ON "ProyectoMateria";
CREATE TRIGGER trg_proyecto_materia_context_coherence
BEFORE INSERT OR UPDATE ON "ProyectoMateria"
FOR EACH ROW EXECUTE FUNCTION fn_proyecto_materia_context_coherence();

DROP TRIGGER IF EXISTS trg_equipo_context_coherence ON "Equipo";
CREATE TRIGGER trg_equipo_context_coherence
BEFORE INSERT OR UPDATE ON "Equipo"
FOR EACH ROW EXECUTE FUNCTION fn_equipo_context_coherence();

DROP TRIGGER IF EXISTS trg_entrega_hito_context_coherence ON "EntregaHito";
CREATE TRIGGER trg_entrega_hito_context_coherence
BEFORE INSERT OR UPDATE ON "EntregaHito"
FOR EACH ROW EXECUTE FUNCTION fn_entrega_hito_context_coherence();

DROP TRIGGER IF EXISTS trg_evaluacion_hito_context_coherence ON "EvaluacionHito";
CREATE TRIGGER trg_evaluacion_hito_context_coherence
BEFORE INSERT OR UPDATE ON "EvaluacionHito"
FOR EACH ROW EXECUTE FUNCTION fn_evaluacion_hito_context_coherence();
