import { ensureIdPositivo } from "../../dominio/entrega/helpersEntrega.js";
import { listarEntregasPorHitoCasoUso } from "../../application/casosUso/entrega/listarEntregasPorHito.js";
import { listarEntregasPorEquipoCasoUso } from "../../application/casosUso/entrega/listarEntregasPorEquipo.js";
import { obtenerEntregaCasoUso } from "../../application/casosUso/entrega/obtenerEntregaID.js";
import { crearEntregaCasoUso } from "../../application/casosUso/entrega/crearEntrega.js";
import { actualizarEntregaCasoUso } from "../../application/casosUso/entrega/actualizarEntrega.js";
import { eliminarEntregaCasoUso } from "../../application/casosUso/entrega/eliminarEntrega.js";

export async function listarEntregasPorHito(req, res, next) {
    try {
        const data = await listarEntregasPorHitoCasoUso(req.query, req.user);
        res.json({ data, mensaje: "Entregas obtenidas correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function listarEntregasPorEquipo(req, res, next) {
    try {
        const data = await listarEntregasPorEquipoCasoUso(req.query, req.user);
        res.json({ data, mensaje: "Entregas obtenidas correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function obtenerEntrega(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await obtenerEntregaCasoUso(id, req.user);
        res.json({ data, mensaje: "Entrega obtenida correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function crearEntrega(req, res, next) {
    try {
        const data = await crearEntregaCasoUso(req.body, req.user);
        res.status(201).json({ data, mensaje: "Entrega creada correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function actualizarEntrega(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await actualizarEntregaCasoUso(id, req.body, req.user);
        res.json({ data, mensaje: "Entrega actualizada correctamente" });
    } catch (e) {
        next(e);
    }
}

export async function eliminarEntrega(req, res, next) {
    try {
        const id = ensureIdPositivo(req.params.id);
        if (!id) return res.status(400).json({ mensaje: "ID inválido" });

        const data = await eliminarEntregaCasoUso(id, req.user);
        res.json({ data, mensaje: "Entrega eliminada correctamente" });
    } catch (e) {
        next(e);
    }
}
