import { ensureIdPositivo } from "../../dominio/equipo/helpersEquipo.js";
import { listarEquiposCasoUso } from "../../application/casosUso/equipo/listarEquipos.js";
import { obtenerEquipoCasoUso } from "../../application/casosUso/equipo/obtenerEquipoID.js";
import { crearEquipoCasoUso } from "../../application/casosUso/equipo/crearEquipo.js";
import { actualizarEquipoCasoUso } from "../../application/casosUso/equipo/actualizarEquipo.js";
import { eliminarEquipoCasoUso } from "../../application/casosUso/equipo/eliminarEquipo.js";
import { listarMiembrosEquipoCasoUso } from "../../application/casosUso/equipo/listarMiembrosEquipo.js";
import { agregarMiembroEquipoCasoUso } from "../../application/casosUso/equipo/agregarMiembroEquipo.js";
import { actualizarMiembroEquipoCasoUso } from "../../application/casosUso/equipo/actualizarMiembroEquipo.js";
import { eliminarMiembroEquipoCasoUso } from "../../application/casosUso/equipo/eliminarMiembroEquipo.js";

export async function listarEquipos(req, res, next) {
    try {
        const data = await listarEquiposCasoUso(req.query);
        res.json({ data, mensaje: "Equipos obtenidos correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function obtenerEquipo(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerEquipoCasoUso(id);
        res.json({ data, mensaje: "Equipo obtenido correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function crearEquipo(req, res, next) {
    try {
        const data = await crearEquipoCasoUso(req.body, req.user);
        res.status(201).json({ data, mensaje: "Equipo creado correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function actualizarEquipo(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await actualizarEquipoCasoUso(id, req.body, req.user);
        res.json({ data, mensaje: "Equipo actualizado correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function eliminarEquipo(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await eliminarEquipoCasoUso(id, req.user);
        res.json({ data, mensaje: "Equipo eliminado correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function listarMiembros(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await listarMiembrosEquipoCasoUso(id);
        res.json({ data, mensaje: "Miembros obtenidos correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function agregarMiembro(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await agregarMiembroEquipoCasoUso(id, req.body, req.user);
        res.status(201).json({ data, mensaje: "Miembro agregado correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function actualizarMiembro(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        const usuarioId = ensureIdPositivo(req.params.usuarioId);
        if (!id || !usuarioId) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await actualizarMiembroEquipoCasoUso(id, usuarioId, req.body, req.user);
        res.json({ data, mensaje: "Miembro actualizado correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function eliminarMiembro(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        const usuarioId = ensureIdPositivo(req.params.usuarioId);
        if (!id || !usuarioId) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await eliminarMiembroEquipoCasoUso(id, usuarioId, req.user);
        res.json({ data, mensaje: "Miembro eliminado correctamente" });
    } catch (e) {
        next(e);
    }
}
