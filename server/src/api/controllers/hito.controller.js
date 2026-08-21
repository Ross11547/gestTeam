import { ensureIdPositivo } from "../../dominio/hito/helpersHito.js";
import { listarHitosPorProyectoCasoUso } from "../../application/casosUso/hito/listarHitosPorProyecto.js";
import { obtenerHitoCasoUso } from "../../application/casosUso/hito/obtenerHitoID.js";
import { crearHitoCasoUso } from "../../application/casosUso/hito/crearHito.js";
import { actualizarHitoCasoUso } from "../../application/casosUso/hito/actualizarHito.js";
import { eliminarHitoCasoUso } from "../../application/casosUso/hito/eliminarHito.js";
import { sembrarHitosBaseCasoUso } from "../../application/casosUso/hito/sembrarHitosBase.js";
import { avanzarEstadoHitoCasoUso } from "../../application/casosUso/hito/avanzarEstadoHito.js";

export async function listarHitosPorProyecto(req, res, next) {
    try {
        const data = await listarHitosPorProyectoCasoUso(req.query);
        res.json({ data, mensaje: "Hitos obtenidos correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function obtenerHito(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerHitoCasoUso(id);
        res.json({ data, mensaje: "Hito obtenido correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function crearHito(req, res, next) {
    try {
        const data = await crearHitoCasoUso(req.body);
        res.status(201).json({ data, mensaje: "Hito creado correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function actualizarHito(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await actualizarHitoCasoUso(id, req.body);
        res.json({ data, mensaje: "Hito actualizado correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function eliminarHito(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await eliminarHitoCasoUso(id);
        res.json({ data, mensaje: "Hito eliminado correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function sembrarHitosBase(req, res, next) {
    try {
        const proyectoId = ensureIdPositivo(req.params.proyectoId);
        if (!proyectoId) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await sembrarHitosBaseCasoUso(proyectoId, req.user);
        res.status(201).json({ data, mensaje: "Hitos del semestre generados correctamente" });
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
