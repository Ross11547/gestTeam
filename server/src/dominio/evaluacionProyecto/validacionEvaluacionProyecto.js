import { z } from "zod";

const idPositivo = z.coerce.number().int().positive();

const tipoEvaluador = z.enum(["DOCENTE", "DIRECTOR", "ADMIN", "JURADO"]);

export const listarEvaluaciones = z.object({
    proyectoId: idPositivo.optional(),
    periodoId: idPositivo.optional(),
    evaluadorId: idPositivo.optional(),
});

export const crearEvaluacion = z.object({
    proyectoId: idPositivo,
    periodoId: idPositivo.optional().nullable(),
    puntaje: z.coerce.number().min(0).max(100),
    comentario: z.string().trim().max(2000).optional(),
    criteriosJson: z.record(z.unknown()).nullable().optional(),
    tipoEvaluador: tipoEvaluador.optional(),
});

export const actualizarEvaluacion = z.object({
    puntaje: z.coerce.number().min(0).max(100).optional(),
    comentario: z.string().trim().max(2000).optional(),
    criteriosJson: z.record(z.unknown()).nullable().optional(),
    tipoEvaluador: tipoEvaluador.optional(),
});
