import { ensureIdPositivo } from "../../dominio/comun/helpersComunes.js";
import { listarEvaluacionHitoCasoUso } from "../../application/casosUso/evaluacionHito/listarEvaluacionHito.js";
import { obtenerEvaluacionHitoCasoUso } from "../../application/casosUso/evaluacionHito/obtenerEvaluacionHito.js";
import { crearEvaluacionHitoCasoUso } from "../../application/casosUso/evaluacionHito/crearEvaluacionHito.js";

function tipoEvaluadorDesdeRol(usuario) {
    const rol = String(usuario?.rol?.nombre || "").trim().toLowerCase();
    if (rol === "director") return "DIRECTOR";
    if (rol === "admin") return "ADMIN";
    return "DOCENTE";
}

export async function listarEvaluacionHito(req, res, next) {
    try {
        const data = await listarEvaluacionHitoCasoUso(req.query, req.user);
        res.json({ data, mensaje: "Evaluaciones obtenidas correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function obtenerEvaluacionHito(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerEvaluacionHitoCasoUso(id, req.user);
        res.json({ data, mensaje: "Evaluación obtenida correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function crearEvaluacionHito(req, res, next) {
    try {
        const payload = {
            ...req.body,
            evaluadorId: req.user.id,
            tipoEvaluador: tipoEvaluadorDesdeRol(req.user),
        };

        const data = await crearEvaluacionHitoCasoUso(payload, req.user);
        res.status(201).json({ data, mensaje: "Evaluación creada correctamente" });
    } catch (e) {
        next(e);
    }
}
