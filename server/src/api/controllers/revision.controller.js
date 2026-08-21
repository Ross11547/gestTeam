import { ensureIdPositivo } from "../../dominio/revision/helpersRevision.js";
import { listarRevisionesPorEntregaCasoUso } from "../../application/casosUso/revision/listarRevisionesPorEntrega.js";
import { crearRevisionCasoUso } from "../../application/casosUso/revision/crearRevision.js";
import { actualizarRevisionCasoUso } from "../../application/casosUso/revision/actualizarRevision.js";
import { eliminarRevisionCasoUso } from "../../application/casosUso/revision/eliminarRevision.js";

export async function listarRevisionesPorEntrega(req, res, next) {
    try {
        const data = await listarRevisionesPorEntregaCasoUso(req.query);
        res.json({ data, mensaje: "Revisiones obtenidas correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function crearRevision(req, res, next) {
    try {
        const data = await crearRevisionCasoUso(req.body, req.user);
        res.status(201).json({ data, mensaje: "Revisión creada correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function actualizarRevision(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await actualizarRevisionCasoUso(id, req.body, req.user);
        res.json({ data, mensaje: "Revisión actualizada correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function eliminarRevision(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await eliminarRevisionCasoUso(id, req.user);
        res.json({ data, mensaje: "Revisión eliminada correctamente" });
    } catch (e) {
        next(e);
    }
}
