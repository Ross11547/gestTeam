import { prisma } from "../db/prisma.client.js";

export const hitoProyectoRepositorio = {
    crearBatch: (dataArray) =>
        prisma.hitoProyecto.createMany({
            data: dataArray,
            skipDuplicates: true,
        }),

    listarPorProyectoPeriodo: (proyectoPeriodoId) =>
        prisma.hitoProyecto.findMany({
            where: { proyectoPeriodoId },
            include: {
                hitoPeriodo: { select: { id: true, orden: true, nombre: true } },
            },
            orderBy: { hitoPeriodo: { orden: "asc" } },
        }),

    obtenerPorId: (id) =>
        prisma.hitoProyecto.findUnique({
            where: { id },
            include: {
                proyectoPeriodo: {
                    include: {
                        proyecto: { select: { id: true } },
                        periodo: { select: { id: true } },
                    },
                },
                hitoPeriodo: { select: { id: true, orden: true } },
            },
        }),
};
