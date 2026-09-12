import { ensureIdPositivo } from "../../dominio/evaluacionProyecto/helpersEvaluacionProyecto.js";
import { listarEvaluacionesCasoUso } from "../../application/casosUso/evaluacionProyecto/listarEvaluaciones.js";
import { obtenerEvaluacionPorIdCasoUso } from "../../application/casosUso/evaluacionProyecto/obtenerEvaluacionPorId.js";
import { crearError } from "../../dominio/comun/helpersComunes.js";

export async function listarEvaluaciones(req, res, next) {
    try {
        const data = await listarEvaluacionesCasoUso(req.query, req.user);
        res.json({ data, mensaje: "Evaluaciones obtenidas correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function obtenerEvaluacion(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerEvaluacionPorIdCasoUso(id, req.user);
        res.json({ data, mensaje: "Evaluación obtenida correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function crearEvaluacion(req, res, next) {
    try {
        throw crearError(
            "Las evaluaciones legacy globales están deprecadas. Utilice EvaluacionHito.",
            410
        );
    } catch (e) {
        next(e);
    }
}

export async function actualizarEvaluacion(req, res, next) {
    try {
        throw crearError(
            "La modificación de evaluaciones legacy globales está deprecada.",
            410
        );
    } catch (e) {
        next(e);
    }
}

export async function eliminarEvaluacion(req, res, next) {
    try {
        throw crearError(
            "La eliminación de evaluaciones legacy globales está deprecada.",
            410
        );
    } catch (e) {
        next(e);
    }
}
