import { z } from "zod";

const idPositivo = z.coerce.number().int().positive();

const fechaString = z.string().refine((v) => !Number.isNaN(Date.parse(v)), "La fecha no es válida");

export const listarFerias = z.object({});

export const crearFeria = z.object({
    institucionId: idPositivo.optional().nullable(),
    nombre: z.string().trim().min(3, "El nombre es obligatorio").max(150),
    descripcion: z.string().trim().max(3000).optional(),
    fecha: fechaString,
    lugar: z.string().trim().max(250).optional(),
    imagenMapaUrl: z.string().trim().url("URL de imagen inválida").optional().nullable(),
});

export const actualizarFeria = crearFeria.partial().extend({
    fecha: fechaString.optional(),
});

export const crearCategoriaFeria = z.object({
    nombre: z.string().trim().min(2).max(120),
    descripcion: z.string().trim().max(1000).optional(),
});

export const inscribirEquipoFeria = z.object({
    equipoId: idPositivo.optional().nullable(),
    categoriaId: idPositivo.optional().nullable(),
    nombreEquipo: z.string().trim().min(2).max(150).optional(),
    nombreProyecto: z.string().trim().min(2).max(200).optional(),
    descripcion: z.string().trim().max(3000).optional(),
    mesaCodigo: z.string().trim().max(30).optional(),
    mesaX: z.number().int().min(0).max(5000).optional(),
    mesaY: z.number().int().min(0).max(5000).optional(),
});

export const actualizarFeriaEquipo = inscribirEquipoFeria.partial();

export const agregarMiembroFeriaEquipo = z.object({
    usuarioId: idPositivo,
});

export const evaluarFeriaEquipo = z.object({
    puntaje: z.coerce.number().min(0).max(100),
    comentario: z.string().trim().max(2000).optional(),
});
