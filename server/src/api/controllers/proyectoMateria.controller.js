import { ensureIdPositivo } from "../../dominio/comun/helpersComunes.js";
import { listarProyectoMateriaCasoUso } from "../../application/casosUso/proyectoMateria/listarProyectoMateria.js";
import { obtenerProyectoMateriaCasoUso } from "../../application/casosUso/proyectoMateria/obtenerProyectoMateria.js";

export async function listarProyectoMateria(req, res, next) {
    try {
        const data = await listarProyectoMateriaCasoUso(req.query, req.user);
        res.json({ data, mensaje: "Contextos académicos obtenidos correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function obtenerProyectoMateria(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerProyectoMateriaCasoUso(id, req.user);
        res.json({ data, mensaje: "Contexto académico obtenido correctamente" });
    } catch (e) {
        next(e);
    }
}
