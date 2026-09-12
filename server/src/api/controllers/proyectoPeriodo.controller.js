import { ensureIdPositivo } from "../../dominio/comun/helpersComunes.js";
import { listarProyectoPeriodoCasoUso } from "../../application/casosUso/proyectoPeriodo/listarProyectoPeriodo.js";
import { obtenerProyectoPeriodoCasoUso } from "../../application/casosUso/proyectoPeriodo/obtenerProyectoPeriodo.js";
import { cerrarProyectoPeriodoCasoUso } from "../../application/casosUso/proyectoPeriodo/cerrarProyectoPeriodo.js";

export async function listarProyectoPeriodo(req, res, next) {
    try {
        const data = await listarProyectoPeriodoCasoUso(req.query, req.user);
        res.json({ data, mensaje: "Proyectos-periodo obtenidos correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function obtenerProyectoPeriodo(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerProyectoPeriodoCasoUso(id, req.user);
        res.json({ data, mensaje: "Proyecto-periodo obtenido correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function cerrarProyectoPeriodo(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await cerrarProyectoPeriodoCasoUso({ proyectoPeriodoId: id }, req.user);
        res.json({ data, mensaje: "ProyectoPeriodo cerrado correctamente" });
    } catch (e) {
        next(e);
    }
}
