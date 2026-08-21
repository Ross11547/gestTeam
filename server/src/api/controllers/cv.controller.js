import { ensureIdPositivo } from "../../dominio/cv/helpersCV.js";
import {
    obtenerMiCVCasoUso,
    obtenerCVDeUsuarioCasoUso,
    guardarMiCVCasoUso,
    eliminarMiCVCasoUso,
} from "../../application/casosUso/cv/gestionarCV.js";
import {
    agregarHabilidadCVCasoUso,
    editarHabilidadCVCasoUso,
    quitarHabilidadCVCasoUso,
    agregarLogroCVCasoUso,
    editarLogroCVCasoUso,
    quitarLogroCVCasoUso,
    agregarProyectoCVCasoUso,
    editarProyectoCVCasoUso,
    quitarProyectoCVCasoUso,
} from "../../application/casosUso/cv/gestionarSeccionesCV.js";

export async function obtenerMiCV(req, res, next) {
    try {
        const data = await obtenerMiCVCasoUso(req.user);
        res.json({ data, mensaje: "CV obtenido correctamente" });
    } catch (e) { next(e); }
}

export async function obtenerCVDeUsuario(req, res, next) {
    try {
        const usuarioId = ensureIdPositivo(req.params.usuarioId);
        if (!usuarioId) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerCVDeUsuarioCasoUso(usuarioId, req.user);
        res.json({ data, mensaje: "CV obtenido correctamente" });
    } catch (e) { next(e); }
}

export async function guardarMiCV(req, res, next) {
    try {
        const data = await guardarMiCVCasoUso(req.body, req.user);
        res.json({ data, mensaje: "CV guardado correctamente" });
    } catch (e) { next(e); }
}

export async function eliminarMiCV(req, res, next) {
    try {
        const data = await eliminarMiCVCasoUso(req.user);
        res.json({ data, mensaje: "CV eliminado correctamente" });
    } catch (e) { next(e); }
}

export async function agregarHabilidad(req, res, next) {
    try {
        const data = await agregarHabilidadCVCasoUso(req.body, req.user);
        res.status(201).json({ data, mensaje: "Habilidad agregada correctamente" });
    } catch (e) { next(e); }
}

export async function editarHabilidad(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await editarHabilidadCVCasoUso(id, req.body, req.user);
        res.json({ data, mensaje: "Habilidad actualizada correctamente" });
    } catch (e) { next(e); }
}

export async function quitarHabilidad(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await quitarHabilidadCVCasoUso(id, req.user);
        res.json({ data, mensaje: "Habilidad eliminada correctamente" });
    } catch (e) { next(e); }
}

export async function agregarLogro(req, res, next) {
    try {
        const data = await agregarLogroCVCasoUso(req.body, req.user);
        res.status(201).json({ data, mensaje: "Logro agregado correctamente" });
    } catch (e) { next(e); }
}

export async function editarLogro(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await editarLogroCVCasoUso(id, req.body, req.user);
        res.json({ data, mensaje: "Logro actualizado correctamente" });
    } catch (e) { next(e); }
}

export async function quitarLogro(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await quitarLogroCVCasoUso(id, req.user);
        res.json({ data, mensaje: "Logro eliminado correctamente" });
    } catch (e) { next(e); }
}

export async function agregarProyectoCV(req, res, next) {
    try {
        const data = await agregarProyectoCVCasoUso(req.body, req.user);
        res.status(201).json({ data, mensaje: "Proyecto agregado al CV correctamente" });
    } catch (e) { next(e); }
}

export async function editarProyectoCV(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await editarProyectoCVCasoUso(id, req.body, req.user);
        res.json({ data, mensaje: "Proyecto del CV actualizado correctamente" });
    } catch (e) { next(e); }
}

export async function quitarProyectoCV(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await quitarProyectoCVCasoUso(id, req.user);
        res.json({ data, mensaje: "Proyecto eliminado del CV correctamente" });
    } catch (e) { next(e); }
}
