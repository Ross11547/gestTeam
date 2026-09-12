import { z } from "zod";

export const crearProyectoPeriodoSchema = z.object({
    proyectoId: z.number().int().positive(),
    periodoId: z.number().int().positive(),
});

export const cerrarProyectoPeriodoSchema = z.object({
    proyectoPeriodoId: z.number().int().positive(),
});

export const vincularProyectoMateriaSchema = z.object({
    proyectoPeriodoId: z.number().int().positive(),
    materiaId: z.number().int().positive(),
    claseId: z.number().int().positive().optional(),
});

export const crearEvaluacionHitoSchema = z.object({
    hitoProyectoId: z.number().int().positive(),
    proyectoMateriaId: z.number().int().positive(),
    evaluadorId: z.number().int().positive(),
    tipoEvaluador: z.enum(["DOCENTE", "ESTUDIANTE", "AUTOEVALUACION", "SISTEMA", "DIRECTOR", "ADMIN", "JURADO"]),
    puntaje: z.number().min(0).max(100).optional(),
    comentario: z.string().max(1000).optional(),
});

export const crearPeriodoAcademicoConHitosSchema = z.object({
    institucionId: z.number().int().positive(),
    nombre: z.string().min(1).max(50),
    fechaIni: z.coerce.date(),
    fechaFin: z.coerce.date(),
    activo: z.boolean().optional(),
});
