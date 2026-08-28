import * as path from "path";
import * as fs from "fs";
import { prisma } from "../db/prisma.client.js";
import { extraerTextoDeDocumento } from "./texto.js";
import { analizarDocumento } from "../similitud/plagio.js";
import {
  incluirProyectoEnDataset,
  exportarDatasetParaEntrenamiento,
  reentrenarModeloDesdeDataset,
} from "./datasetPlagio.js";

export async function uploadDocumento(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: "No se envió ningún archivo." });
    }

    const file = req.file;

    const entregaId = req.body?.entregaId ? Number(req.body.entregaId) : null;

    const documento = await prisma.documento.create({
      data: {
        nombre: file.originalname,
        ruta: file.path,
        mimetype: file.mimetype,
        tamano: file.size,
        usuarioId: req.user?.id ?? null,
        entregaId: entregaId && !Number.isNaN(entregaId) ? entregaId : null,
      },
    });

    try {
      const rutaAbsoluta = path.resolve(file.path);
      const texto = await extraerTextoDeDocumento(
        rutaAbsoluta,
        file.mimetype,
        file.originalname,
      );

      await prisma.documento.update({
        where: { id: documento.id },
        data: { contenidoTexto: texto },
      });
    } catch (e) {
      console.error("Error extrayendo texto:", e.message);
    }

    return res.json({ documentoId: documento.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error subiendo documento." });
  }
}

export async function analizar(req, res) {
  try {
    const { documentoId } = req.body;
    if (!documentoId) {
      return res.status(400).json({ mensaje: "Falta documentoId." });
    }

    const documento = await prisma.documento.findUnique({
      where: { id: Number(documentoId) },
      select: { id: true, usuarioId: true },
    });
    if (!documento) {
      return res.status(404).json({ mensaje: "Documento no encontrado." });
    }

    const rol = String(req.user?.rol?.nombre || "")
      .trim()
      .toLowerCase();
    const esStaff = rol === "admin" || rol === "director";
    if (!esStaff && documento.usuarioId !== req.user?.id) {
      return res
        .status(403)
        .json({ mensaje: "No puedes analizar un documento ajeno." });
    }

    const resultado = await analizarDocumento(Number(documentoId));
    return res.json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error analizando documento.",
      error: error.message,
    });
  }
}

export async function uploadRepositorioUnifranz(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: "No se envió ningún archivo." });
    }

    const file = req.file;

    const entergaIdRepo = req.body?.entregaId
      ? Number(req.body.entregaId)
      : null;

    const documento = await prisma.documento.create({
      data: {
        nombre: file.originalname,
        ruta: file.path,
        mimetype: file.mimetype,
        tamano: file.size,
        usuario: req.user?.id ?? null,
        entrega:
          entergaIdRepo && !Number.isNaN(entergaIdRepo) ? entergaIdRepo : null,
        esRepositorioUnifranz: true,
      },
    });

    try {
      const rutaAbsoluta = path.resolve(file.path);
      const texto = await extraerTextoDeDocumento(
        rutaAbsoluta,
        file.mimetype,
        file.originalname,
      );

      await prisma.documento.update({
        where: { id: documento.id },
        data: { contenidoTexto: texto },
      });
    } catch (e) {
      console.error("Error extrayendo texto (repo):", e.message);
    }

    return res.json({ ok: true, documentoId: documento.id });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ mensaje: "Error subiendo a repositorio UNIFRANZ." });
  }
}
export async function incluirProyecto(req, res) {
  try {
    const proyectoId = Number(req.params.proyectoId || req.body?.proyectoId);
    if (!proyectoId || Number.isNaN(proyectoId)) {
      return res.status(400).json({ mensaje: "Falta proyectoId válido." });
    }

    const forzar = req.body?.forzar === true || req.query?.forzar === "true";
    const resultado = await incluirProyectoEnDataset(proyectoId, {
      forzar,
      creadoPorId: req.user?.id,
    });

    if (!resultado.ok) {
      return res.status(422).json(resultado);
    }

    return res.json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Error incluyendo proyecto en dataset.",
      error: error.message,
    });
  }
}

export async function exportarDataset(req, res) {
  try {
    const resultado = await exportarDatasetParaEntrenamiento();
    return res.json({
      ok: true,
      mensaje: "Dataset exportado correctamente.",
      ruta: resultado.ruta,
      pares: resultado.filas,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Error exportando dataset.",
      error: error.message,
    });
  }
}

export async function reentrenarModelo(req, res) {
  try {
    const resultado = await reentrenarModeloDesdeDataset();
    return res.json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Error preparando reentrenamiento.",
      error: error.message,
    });
  }
}
