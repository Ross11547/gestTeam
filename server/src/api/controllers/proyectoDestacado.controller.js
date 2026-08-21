import { ensureIdPositivo } from "../../dominio/proyectoDestacado/helpersProyectoDestacado.js";
import {
    listarProyectosDestacadosCasoUso,
    crearProyectoDestacadoCasoUso,
    actualizarProyectoDestacadoCasoUso,
    eliminarProyectoDestacadoCasoUso,
} from "../../application/casosUso/proyectoDestacado/gestionarProyectosDestacados.js";

export async function listarDestacados(req, res, next) {
    try {
        const data = await listarProyectosDestacadosCasoUso();
        res.json({ data, mensaje: "Proyectos destacados obtenidos correctamente" });
    } catch (e) { next(e); }
}

export async function crearDestacado(req, res, next) {
    try {
        const data = await crearProyectoDestacadoCasoUso(req.body);
        res.status(201).json({ data, mensaje: "Proyecto destacado correctamente" });
    } catch (e) { next(e); }
}

export async function actualizarDestacado(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await actualizarProyectoDestacadoCasoUso(id, req.body);
        res.json({ data, mensaje: "Destacado actualizado correctamente" });
    } catch (e) { next(e); }
}

export async function eliminarDestacado(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await eliminarProyectoDestacadoCasoUso(id);
        res.json({ data, mensaje: "Destacado eliminado correctamente" });
    } catch (e) { next(e); }
}
