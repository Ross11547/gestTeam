import { z } from "zod";

export const crearRevision = z.object({
    entregaId: z
        .number({ required_error: "La entrega es obligatoria" })
        .int()
        .positive("La entrega es obligatoria"),

    nota: z
        .number({ invalid_type_error: "La nota debe ser un número" })
        .min(0, "La nota no puede ser negativa")
        .max(100, "La nota no puede ser mayor a 100")
        .nullable()
        .optional(),

    feedback: z.string().trim().max(2000, "El feedback es demasiado largo").optional(),
});

export const actualizarRevision = z.object({
    nota: z
        .number({ invalid_type_error: "La nota debe ser un número" })
        .min(0, "La nota no puede ser negativa")
        .max(100, "La nota no puede ser mayor a 100")
        .nullable()
        .optional(),

    feedback: z.string().trim().max(2000, "El feedback es demasiado largo").optional(),
});
