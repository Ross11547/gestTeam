import { ensureIdPositivo } from "../../dominio/feria/helpersFeria.js";
import { listarFeriasCasoUso, obtenerFeriaPorIdCasoUso } from "../../application/casosUso/feria/listarFerias.js";
import { crearFeriaCasoUso, actualizarFeriaCasoUso, eliminarFeriaCasoUso } from "../../application/casosUso/feria/gestionarFerias.js";
import { listarCategoriasFeriaCasoUso, crearCategoriaFeriaCasoUso, eliminarCategoriaFeriaCasoUso } from "../../application/casosUso/feria/gestionarCategoriasFeria.js";
import {
    listarEquiposFeriaCasoUso,
    inscribirEquipoFeriaCasoUso,
    actualizarFeriaEquipoCasoUso,
    eliminarFeriaEquipoCasoUso,
    agregarMiembroFeriaEquipoCasoUso,
    eliminarMiembroFeriaEquipoCasoUso,
} from "../../application/casosUso/feria/gestionarEquiposFeria.js";
import { evaluarFeriaEquipoCasoUso, listarEvaluacionesFeriaEquipoCasoUso } from "../../application/casosUso/feria/gestionarEvaluacionesFeria.js";

export async function listarFerias(req, res, next) {
    try {
        const data = await listarFeriasCasoUso();
        res.json({ data, mensaje: "Ferias obtenidas correctamente" });
    } catch (e) { next(e); }
}

export async function obtenerFeria(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerFeriaPorIdCasoUso(id);
        if (!data) return res.status(404).json({ mensaje: "La feria indicada no existe" });

        res.json({ data, mensaje: "Feria obtenida correctamente" });
    } catch (e) { next(e); }
}

export async function crearFeria(req, res, next) {
    try {
        const data = await crearFeriaCasoUso(req.body);
        res.status(201).json({ data, mensaje: "Feria creada correctamente" });
    } catch (e) { next(e); }
}

export async function actualizarFeria(req, res, next) {
    try {
        const data = await actualizarFeriaCasoUso(req.params.id, req.body);
        res.json({ data, mensaje: "Feria actualizada correctamente" });
    } catch (e) { next(e); }
}

export async function eliminarFeria(req, res, next) {
    try {
        const data = await eliminarFeriaCasoUso(req.params.id);
        res.json({ data, mensaje: "Feria eliminada correctamente" });
    } catch (e) { next(e); }
}

export async function listarCategoriasFeria(req, res, next) {
    try {
        const data = await listarCategoriasFeriaCasoUso(req.params.feriaId);
        res.json({ data, mensaje: "Categorías obtenidas correctamente" });
    } catch (e) { next(e); }
}

export async function crearCategoriaFeria(req, res, next) {
    try {
        const data = await crearCategoriaFeriaCasoUso(req.params.feriaId, req.body);
        res.status(201).json({ data, mensaje: "Categoría creada correctamente" });
    } catch (e) { next(e); }
}

export async function eliminarCategoriaFeria(req, res, next) {
    try {
        const data = await eliminarCategoriaFeriaCasoUso(req.params.feriaId, req.params.categoriaId);
        res.json({ data, mensaje: "Categoría eliminada correctamente" });
    } catch (e) { next(e); }
}

export async function listarEquiposFeria(req, res, next) {
    try {
        const data = await listarEquiposFeriaCasoUso(req.params.feriaId);
        res.json({ data, mensaje: "Participantes obtenidos correctamente" });
    } catch (e) { next(e); }
}

export async function inscribirEquipoFeria(req, res, next) {
    try {
        const data = await inscribirEquipoFeriaCasoUso(req.params.feriaId, req.body);
        res.status(201).json({ data, mensaje: "Equipo inscrito en la feria correctamente" });
    } catch (e) { next(e); }
}

export async function actualizarFeriaEquipo(req, res, next) {
    try {
        const data = await actualizarFeriaEquipoCasoUso(req.params.participacionId, req.body);
        res.json({ data, mensaje: "Participación actualizada correctamente" });
    } catch (e) { next(e); }
}

export async function eliminarFeriaEquipo(req, res, next) {
    try {
        const data = await eliminarFeriaEquipoCasoUso(req.params.participacionId);
        res.json({ data, mensaje: "Participación eliminada correctamente" });
    } catch (e) { next(e); }
}

export async function agregarMiembroFeriaEquipo(req, res, next) {
    try {
        const data = await agregarMiembroFeriaEquipoCasoUso(req.params.participacionId, req.body);
        res.json({ data, mensaje: "Miembro agregado a la participación" });
    } catch (e) { next(e); }
}

export async function eliminarMiembroFeriaEquipo(req, res, next) {
    try {
        const data = await eliminarMiembroFeriaEquipoCasoUso(req.params.participacionId, req.params.usuarioId);
        res.json({ data, mensaje: "Miembro eliminado de la participación" });
    } catch (e) { next(e); }
}

export async function evaluarFeriaEquipo(req, res, next) {
    try {
        const data = await evaluarFeriaEquipoCasoUso(req.params.participacionId, req.body, req.user);
        res.status(201).json({ data, mensaje: "Evaluación registrada correctamente" });
    } catch (e) { next(e); }
}

export async function listarEvaluacionesFeriaEquipo(req, res, next) {
    try {
        const data = await listarEvaluacionesFeriaEquipoCasoUso(req.params.participacionId);
        res.json({ data, mensaje: "Evaluaciones obtenidas correctamente" });
    } catch (e) { next(e); }
}
