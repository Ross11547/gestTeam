import { z } from "zod";

// Fechas llegan como string ISO o null; el caso de uso las convierte a Date.
const fechaString = z
    .string({ invalid_type_error: "La fecha debe ser una fecha válida" })
    .refine((v) => !Number.isNaN(Date.parse(v)), "La fecha no es válida");

const fechaOpcional = fechaString.nullable().optional();

export const crearHito = z.object({
    proyectoId: z
        .number({ required_error: "El proyecto es obligatorio" })
        .int()
        .positive("El proyecto es obligatorio"),

    orden: z
        .number({ required_error: "El orden del hito es obligatorio" })
        .int()
        .positive("El orden debe ser un número positivo"),

    nombre: z
        .string({ required_error: "El nombre del hito es obligatorio" })
        .trim()
        .min(2, "El nombre del hito es obligatorio")
        .max(120, "El nombre del hito es demasiado largo"),

    descripcion: z.string().trim().max(2000, "La descripción es demasiado larga").optional(),

    peso: z.number().int().min(0).max(100).nullable().optional(),

    fechaInicio: fechaOpcional,
    fechaFin: fechaOpcional,

    estado: z.enum(["PENDIENTE", "ACTIVO", "FINALIZADO", "CANCELADO"]).optional(),
});

export const avanzarHito = z.object({
    estado: z.enum(["ACTIVO", "FINALIZADO", "CANCELADO", "PENDIENTE"]),
});

// El estado del hito SOLO cambia por la máquina de estados de /avanzar.
export const actualizarHito = crearHito.omit({ proyectoId: true, estado: true }).partial();
