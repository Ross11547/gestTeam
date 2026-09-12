import { prisma } from "../db/prisma.client.js";

export const proyectoPeriodoRepositorio = {
    crear: (data) =>
        prisma.proyectoPeriodo.create({
            data,
            include: {
                proyecto: { select: { id: true, titulo: true } },
                periodo: { select: { id: true, nombre: true } },
            },
        }),

    obtenerPorId: (id) =>
        prisma.proyectoPeriodo.findUnique({
            where: { id },
            include: {
                proyecto: { select: { id: true, titulo: true } },
                periodo: { select: { id: true, nombre: true } },
                proyectosMateria: true,
                equipos: true,
                hitos: {
                    include: {
                        hitoPeriodo: { select: { id: true, orden: true, nombre: true } },
                    },
                },
            },
        }),

    existePorProyectoYPeriodo: (proyectoId, periodoId) =>
        prisma.proyectoPeriodo.findUnique({
            where: { proyectoId_periodoId: { proyectoId, periodoId } },
            select: { id: true },
        }),

    actualizar: (id, data) =>
        prisma.proyectoPeriodo.update({
            where: { id },
            data,
            include: {
                proyecto: { select: { id: true, titulo: true } },
                periodo: { select: { id: true, nombre: true } },
            },
        }),
};
