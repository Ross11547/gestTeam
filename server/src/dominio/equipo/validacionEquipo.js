import { z } from "zod";

const tiposGrupo = ["INDIVIDUAL", "GRUPAL", "COLABORATIVO"];
const rolesMiembro = ["LIDER", "MIEMBRO", "COLABORADOR"];

const idOpcional = z.number().int().positive().nullable().optional();

export const crearEquipo = z.object({
    proyectoId: z
        .number({ required_error: "El proyecto es obligatorio" })
        .int()
        .positive("El proyecto es obligatorio"),

    nombre: z
        .string({ required_error: "El nombre del equipo es obligatorio" })
        .trim()
        .min(2, "El nombre del equipo es obligatorio")
        .max(120, "El nombre del equipo es demasiado largo"),

    tipoGrupo: z.enum(tiposGrupo, {
        invalid_type_error: "El tipo de grupo es inválido",
    }).optional(),

    materiaId: idOpcional,
    periodoId: idOpcional,
    claseId: idOpcional,
    proyectoPeriodoId: idOpcional,
    proyectoMateriaId: idOpcional,
});

export const actualizarEquipo = crearEquipo.omit({ proyectoId: true }).partial();

export const agregarMiembro = z.object({
    usuarioId: z
        .number({ required_error: "El usuario es obligatorio" })
        .int()
        .positive("El usuario es obligatorio"),

    rolEquipo: z.enum(rolesMiembro, {
        invalid_type_error: "El rol dentro del equipo es inválido",
    }).optional(),
});

export const actualizarMiembro = z.object({
    rolEquipo: z.enum(rolesMiembro, {
        invalid_type_error: "El rol dentro del equipo es inválido",
    }).optional(),

    activo: z.boolean().optional(),
});
