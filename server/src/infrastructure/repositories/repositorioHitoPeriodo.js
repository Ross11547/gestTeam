import { prisma } from "../db/prisma.client.js";

export const hitoPeriodoRepositorio = {
    contarPorPeriodo: (periodoId) =>
        prisma.hitoPeriodo.count({ where: { periodoId } }),

    listarPorPeriodo: (periodoId) =>
        prisma.hitoPeriodo.findMany({
            where: { periodoId },
            orderBy: { orden: "asc" },
        }),

    crearBatch: (dataArray) =>
        prisma.hitoPeriodo.createMany({
            data: dataArray,
            skipDuplicates: true,
        }),

    obtenerPorPeriodoYOrden: (periodoId, orden) =>
        prisma.hitoPeriodo.findUnique({
            where: { periodoId_orden: { periodoId, orden } },
        }),
};
