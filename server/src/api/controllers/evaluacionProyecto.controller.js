import { ensureIdPositivo } from "../../dominio/evaluacionProyecto/helpersEvaluacionProyecto.js";
import { listarEvaluacionesCasoUso } from "../../application/casosUso/evaluacionProyecto/listarEvaluaciones.js";
import { obtenerEvaluacionPorIdCasoUso } from "../../application/casosUso/evaluacionProyecto/obtenerEvaluacionPorId.js";
import { crearEvaluacionCasoUso } from "../../application/casosUso/evaluacionProyecto/crearEvaluacion.js";
import { actualizarEvaluacionCasoUso } from "../../application/casosUso/evaluacionProyecto/actualizarEvaluacion.js";
import { eliminarEvaluacionCasoUso } from "../../application/casosUso/evaluacionProyecto/eliminarEvaluacion.js";

export async function listarEvaluaciones(req, res, next) {
    try {
        const data = await listarEvaluacionesCasoUso(req.query);
        res.json({ data, mensaje: "Evaluaciones obtenidas correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function obtenerEvaluacion(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerEvaluacionPorIdCasoUso(id);
        res.json({ data, mensaje: "Evaluación obtenida correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function crearEvaluacion(req, res, next) {
    try {
        const data = await crearEvaluacionCasoUso(req.body, req.user);
        res.status(201).json({ data, mensaje: "Evaluación registrada correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function actualizarEvaluacion(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await actualizarEvaluacionCasoUso(id, req.body, req.user);
        res.json({ data, mensaje: "Evaluación actualizada correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function eliminarEvaluacion(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await eliminarEvaluacionCasoUso(id, req.user);
        res.json({ data, mensaje: "Evaluación eliminada correctamente" });
    } catch (e) {
        next(e);
    }
}
