import { ensureIdPositivo } from "../../dominio/proyecto/helpersProyecto.js";
import { listarProyectosCasoUso } from "../../application/casosUso/proyecto/listarProyectos.js";
import { obtenerProyectoCasoUso } from "../../application/casosUso/proyecto/obtenerProyectoID.js";
import { crearProyectoCasoUso } from "../../application/casosUso/proyecto/crearProyecto.js";
import { actualizarProyectoCasoUso } from "../../application/casosUso/proyecto/actualizarProyecto.js";
import { eliminarProyectoCasoUso } from "../../application/casosUso/proyecto/eliminarProyecto.js";
import { listarCatalogoIntegradoresCasoUso } from "../../application/casosUso/proyecto/listarCatalogoIntegradores.js";
import { validarCierreProyectoCasoUso } from "../../application/casosUso/proyecto/validarCierreProyecto.js";
import { declararProyectoInconclusoCasoUso } from "../../application/casosUso/proyecto/declararProyectoInconcluso.js";
import { cerrarProyectoDefinitivamenteCasoUso } from "../../application/casosUso/proyecto/cerrarProyectoDefinitivamente.js";
import {
    listarCatalogoProyectosCasoUso,
    obtenerCatalogoProyectoCasoUso,
} from "../../application/casosUso/proyecto/catalogoProyectos.js";
import { listarDocumentosSolicitablesCasoUso } from "../../application/casosUso/solicitudAcceso/listarDocumentosSolicitables.js";

export async function listarProyectos(req, res, next) {
    try {
        const data = await listarProyectosCasoUso(req.user);
        res.json({ data, mensaje: "Proyectos obtenidos correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function listarCatalogoIntegradores(req, res, next) {
    try {
        const data = await listarCatalogoIntegradoresCasoUso(req.query);
        res.json({ data, mensaje: "Catálogo de proyectos integradores obtenido correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function listarCatalogoProyectos(req, res, next) {
    try {
        const resultado = await listarCatalogoProyectosCasoUso(req.query, req.user);
        res.json({
            data: resultado.proyectos,
            paginacion: resultado.paginacion,
            mensaje: "Catálogo de proyectos obtenido correctamente",
        });
    } catch (e) {
        next(e);
    }
}

export async function obtenerCatalogoProyecto(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });
        const data = await obtenerCatalogoProyectoCasoUso(id, req.user);
        res.json({ data, mensaje: "Proyecto de catálogo obtenido correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function listarDocumentosSolicitables(req, res, next) {
    try {
        const data = await listarDocumentosSolicitablesCasoUso(req.params.proyectoId, req.user);
        res.json({ data, mensaje: "Documentación solicitable obtenida correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function validarCierreProyecto(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await validarCierreProyectoCasoUso(id, req.query.proyectoPeriodoId, req.user);
        res.json({ data, mensaje: "Validación de cierre obtenida correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function declararProyectoInconcluso(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await declararProyectoInconclusoCasoUso(id, req.body, req.user);
        res.json({ data, mensaje: "Proyecto declarado inconcluso correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function cerrarProyectoDefinitivamente(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await cerrarProyectoDefinitivamenteCasoUso(id, req.body, req.user);
        res.json({ data, mensaje: "Proyecto cerrado definitivamente" });
    } catch (e) {
        next(e);
    }
}

export async function obtenerProyecto(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerProyectoCasoUso(id, req.user);
        res.json({ data, mensaje: "Proyecto obtenido correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function crearProyecto(req, res, next) {
    try {
        const data = await crearProyectoCasoUso(req.body, req.user);
        res.status(201).json({ data, mensaje: "Proyecto creado correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function actualizarProyecto(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await actualizarProyectoCasoUso(id, req.body, req.user);
        res.json({ data, mensaje: "Proyecto actualizado correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function eliminarProyecto(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await eliminarProyectoCasoUso(id, req.user);
        res.json({ data, mensaje: "Proyecto eliminado correctamente" });
    } catch (e) {
        next(e);
    }
}
