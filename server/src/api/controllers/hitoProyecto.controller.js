import { ensureIdPositivo } from "../../dominio/comun/helpersComunes.js";
import { listarHitoProyectoCasoUso } from "../../application/casosUso/hitoProyecto/listarHitoProyecto.js";
import { obtenerHitoProyectoCasoUso } from "../../application/casosUso/hitoProyecto/obtenerHitoProyecto.js";

export async function listarHitoProyecto(req, res, next) {
    try {
        const data = await listarHitoProyectoCasoUso(req.query, req.user);
        res.json({ data, mensaje: "Hitos del proyecto obtenidos correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function obtenerHitoProyecto(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerHitoProyectoCasoUso(id, req.user);
        res.json({ data, mensaje: "Hito del proyecto obtenido correctamente" });
    } catch (e) {
        next(e);
    }
}
