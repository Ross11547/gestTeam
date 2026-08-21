import { ensureIdPositivo } from "../../dominio/reporte/helpersReporte.js";
import { generarReporteCasoUso } from "../../application/casosUso/reporte/generarReporte.js";
import { listarReportesCasoUso, obtenerReporteCasoUso, eliminarReporteCasoUso } from "../../application/casosUso/reporte/consultarReportes.js";

export async function generar(req, res, next) {
    try {
        const data = await generarReporteCasoUso(req.body, req.user);
        res.status(201).json({ data, mensaje: "Reporte generado correctamente" });
    } catch (e) { next(e); }
}

export async function listar(req, res, next) {
    try {
        const data = await listarReportesCasoUso(req.query);
        res.json({ data, mensaje: "Reportes listados correctamente" });
    } catch (e) { next(e); }
}

export async function obtenerPorId(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerReporteCasoUso(id);
        res.json({ data, mensaje: "Reporte obtenido correctamente" });
    } catch (e) { next(e); }
}

export async function eliminar(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await eliminarReporteCasoUso(id, req.user);
        res.json({ data, mensaje: "Reporte eliminado correctamente" });
    } catch (e) { next(e); }
}
