import { z } from "zod";

const idPositivo = z.coerce.number().int().positive();

export const crearProyectoDestacado = z.object({
    proyectoId: idPositivo,
    periodoId: idPositivo.optional().nullable(),
    idFacultad: idPositivo.optional().nullable(),
    idCarrera: idPositivo.optional().nullable(),
    motivo: z.string().trim().max(2000).optional(),
    orden: z.number().int().min(1).max(999).optional(),
});

export const actualizarProyectoDestacado = crearProyectoDestacado.omit({ proyectoId: true }).partial();
