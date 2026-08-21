import { ensureIdPositivo } from "../../dominio/solicitudAcceso/helpersSolicitudAcceso.js";
import { listarSolicitudesAccesoCasoUso } from "../../application/casosUso/solicitudAcceso/listarSolicitudesAcceso.js";
import { crearSolicitudAccesoCasoUso } from "../../application/casosUso/solicitudAcceso/crearSolicitudAcceso.js";
import { resolverSolicitudAccesoCasoUso } from "../../application/casosUso/solicitudAcceso/resolverSolicitudAcceso.js";
import { cancelarSolicitudAccesoCasoUso } from "../../application/casosUso/solicitudAcceso/cancelarSolicitudAcceso.js";

export async function listarSolicitudes(req, res, next) {
    try {
        const data = await listarSolicitudesAccesoCasoUso(req.query, req.user);
        res.json({ data, mensaje: "Solicitudes obtenidas correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function crearSolicitud(req, res, next) {
    try {
        const data = await crearSolicitudAccesoCasoUso(req.body, req.user);
        res.status(201).json({ data, mensaje: "Solicitud enviada correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function resolverSolicitud(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await resolverSolicitudAccesoCasoUso(id, req.body, req.user);
        res.json({ data, mensaje: "Solicitud resuelta correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function cancelarSolicitud(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await cancelarSolicitudAccesoCasoUso(id, req.user);
        res.json({ data, mensaje: "Solicitud eliminada correctamente" });
    } catch (e) {
        next(e);
    }
}
