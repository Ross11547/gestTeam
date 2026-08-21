import { z } from "zod";

const estadosEntrega = ["BORRADOR", "ENTREGADO", "REVISADO", "DEVUELTO", "ATRASADO"];

// evidenciaUrl acepta URL válida, cadena vacía (se normaliza a null) o null.
const evidenciaUrl = z
    .union([z.string().trim().url("La evidencia debe ser una URL válida").max(500), z.literal(""), z.null()])
    .optional();

export const crearEntrega = z.object({
    hitoId: z
        .number({ required_error: "El hito es obligatorio" })
        .int()
        .positive("El hito es obligatorio"),

    equipoId: z
        .number({ required_error: "El equipo es obligatorio" })
        .int()
        .positive("El equipo es obligatorio"),

    estado: z.enum(estadosEntrega, {
        invalid_type_error: "El estado de la entrega es inválido",
    }).optional(),

    comentario: z.string().trim().max(2000, "El comentario es demasiado largo").optional(),

    evidenciaUrl,
});

export const actualizarEntrega = z.object({
    estado: z.enum(estadosEntrega, {
        invalid_type_error: "El estado de la entrega es inválido",
    }).optional(),

    comentario: z.string().trim().max(2000, "El comentario es demasiado largo").optional(),

    evidenciaUrl,
});
