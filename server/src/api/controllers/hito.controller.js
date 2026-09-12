import { ensureIdPositivo } from "../../dominio/hito/helpersHito.js";
import { listarHitosPorProyectoCasoUso } from "../../application/casosUso/hito/listarHitosPorProyecto.js";
import { obtenerHitoCasoUso } from "../../application/casosUso/hito/obtenerHitoID.js";
import { crearHitoCasoUso } from "../../application/casosUso/hito/crearHito.js";
import { actualizarHitoCasoUso } from "../../application/casosUso/hito/actualizarHito.js";
import { eliminarHitoCasoUso } from "../../application/casosUso/hito/eliminarHito.js";
import { sembrarHitosBaseCasoUso } from "../../application/casosUso/hito/sembrarHitosBase.js";
import { avanzarEstadoHitoCasoUso } from "../../application/casosUso/hito/avanzarEstadoHito.js";
import { crearError } from "../../dominio/comun/helpersComunes.js";

export async function listarHitosPorProyecto(req, res, next) {
    try {
        const data = await listarHitosPorProyectoCasoUso(req.query, req.user);
        res.json({ data, mensaje: "Hitos obtenidos correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function obtenerHito(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerHitoCasoUso(id, req.user);
        res.json({ data, mensaje: "Hito obtenido correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function crearHito(req, res, next) {
    try {
        throw crearError(
            "La creación manual de hitos no está disponible. Los hitos se generan al crear un ProyectoPeriodo.",
            410
        );
    } catch (e) {
        next(e);
    }
}

export async function actualizarHito(req, res, next) {
    try {
        throw crearError(
            "La modificación manual de hitos no está disponible.",
            410
        );
    } catch (e) {
        next(e);
    }
}

export async function eliminarHito(req, res, next) {
    try {
        throw crearError(
            "La eliminación manual de hitos no está disponible.",
            410
        );
    } catch (e) {
        next(e);
    }
}

export async function sembrarHitosBase(req, res, next) {
    try {
        throw crearError(
            "El sembrado legacy de hitos está deprecado. Utilice crearProyectoPeriodo.",
            410
        );
    } catch (e) {
        next(e);
    }
}

export async function avanzarHito(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await avanzarEstadoHitoCasoUso(id, req.body, req.user);
        res.json({ data, mensaje: "Estado del hito actualizado correctamente" });
    } catch (e) {
        next(e);
    }
}
