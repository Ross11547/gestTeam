import { z } from "zod";

const idPositivo = z.coerce.number().int().positive();

export const crearSolicitudAcceso = z.object({
    proyectoId: idPositivo,
    tipo: z.enum(["DOCUMENTOS", "CODIGO", "AMBOS"]).default("AMBOS"),
    motivo: z.string().trim().max(1000).optional(),
    expiresAt: z.coerce.date().optional().nullable(),
});

export const listarSolicitudesAcceso = z.object({
    proyectoId: idPositivo.optional(),
    estado: z.enum(["PENDIENTE", "APROBADA", "RECHAZADA", "EXPIRADA"]).optional(),
});

export const resolverSolicitudAcceso = z.object({
    estado: z.enum(["APROBADA", "RECHAZADA"]),
    respuesta: z.string().trim().max(1000).optional(),
    expiresAt: z.coerce.date().optional().nullable(),
    agregarMiembro: z.boolean().default(true),
});
