import { z } from "zod";

const idPositivo = z.coerce.number().int().positive();

export const crearSolicitudAcceso = z.object({
    proyectoId: idPositivo,
    proyectoMateriaId: idPositivo,
    documentoIds: z.array(idPositivo).min(1).max(50).transform((ids) => [...new Set(ids)]),
    motivo: z.string().trim().max(1000).optional(),
}).strict();

export const listarSolicitudesAcceso = z.object({
    proyectoId: idPositivo.optional(),
    proyectoMateriaId: idPositivo.optional(),
    estado: z.enum(["PENDIENTE", "APROBADA", "RECHAZADA", "EXPIRADA"]).optional(),
}).strict();

export const resolverSolicitudAcceso = z.object({
    estado: z.enum(["APROBADA", "RECHAZADA"]),
    respuesta: z.string().trim().max(1000).optional(),
    expiresAt: z.coerce.date().optional().nullable(),
}).strict();
