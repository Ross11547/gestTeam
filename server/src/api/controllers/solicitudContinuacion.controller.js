import { ensureIdPositivo } from "../../dominio/comun/helpersComunes.js";
import { listarSolicitudContinuacionCasoUso, obtenerSolicitudContinuacionCasoUso } from "../../application/casosUso/solicitudContinuacion/gestionSolicitudContinuacion.js";
import { crearSolicitudContinuacionProyectoCasoUso } from "../../application/casosUso/solicitudContinuacion/crearSolicitudContinuacionProyecto.js";
import { resolverSolicitudContinuacionCasoUso } from "../../application/casosUso/solicitudContinuacion/resolverSolicitudContinuacion.js";

export async function listarSolicitudContinuacion(req, res, next) {
    try {
        const data = await listarSolicitudContinuacionCasoUso(req.query, req.user);
        res.json({ data, mensaje: "Solicitudes obtenidas correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function obtenerSolicitudContinuacion(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerSolicitudContinuacionCasoUso(id, req.user);
        res.json({ data, mensaje: "Solicitud obtenida correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function crearSolicitudContinuacion(req, res, next) {
    try {
        const data = await crearSolicitudContinuacionProyectoCasoUso(req.body, req.user);
        res.status(201).json({ data, mensaje: "Solicitud de continuación creada correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function resolverSolicitudContinuacion(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await resolverSolicitudContinuacionCasoUso(id, req.body, req.user);
        res.json({ data, mensaje: "Solicitud de continuación resuelta correctamente" });
    } catch (e) {
        next(e);
    }
}
