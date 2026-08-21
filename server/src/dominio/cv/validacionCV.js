import { z } from "zod";

const idPositivo = z.coerce.number().int().positive();

// Las fechas llegan como string ISO o null; el caso de uso convierte a Date.
const fechaOpcional = z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "La fecha no es válida")
    .nullable()
    .optional();

const urlOpcional = z.string().trim().url("URL inválida").nullable().optional();

export const guardarCV = z.object({
    resumen: z.string().trim().max(3000, "El resumen es demasiado largo").optional(),
});

export const habilidadCV = z.object({
    nombre: z.string().trim().min(2, "El nombre de la habilidad es obligatorio").max(80),
    categoria: z.string().trim().max(60).optional(),
    nivel: z.number().int().min(1).max(5).nullable().optional(),
    evidencia: urlOpcional,
});

export const logroCV = z.object({
    titulo: z.string().trim().min(2, "El título del logro es obligatorio").max(150),
    descripcion: z.string().trim().max(2000).optional(),
    fecha: fechaOpcional,
});

export const proyectoCV = z.object({
    titulo: z.string().trim().min(2, "El título del proyecto es obligatorio").max(200),
    descripcion: z.string().trim().max(3000).optional(),
    rol: z.string().trim().max(100).optional(),
    area: z.string().trim().max(100).optional(),
    tecnologias: z.string().trim().max(500).optional(),
    linkEvidencia: urlOpcional,
    fechaInicio: fechaOpcional,
    fechaFin: fechaOpcional,
});

export { idPositivo };
