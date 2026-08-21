import { prisma } from "../db/prisma.client.js";

const INCLUDE_REVISION = {
    entrega: {
        select: {
            id: true,
            estado: true,
            hito: { select: { id: true, nombre: true } },
            equipo: { select: { id: true, nombre: true } },
        },
    },
    revisor: {
        select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
        },
    },
};

export const revisionRepositorio = {
    listarPorEntrega: (entregaId) =>
        prisma.revisionEntrega.findMany({
            where: { entregaId },
            orderBy: { createdAt: "desc" },
            include: INCLUDE_REVISION,
        }),

    obtenerPorId: (id) =>
        prisma.revisionEntrega.findUnique({
            where: { id },
            include: INCLUDE_REVISION,
        }),

    crear: (data) =>
        prisma.revisionEntrega.create({
            data,
            include: INCLUDE_REVISION,
        }),

    actualizar: (id, data) =>
        prisma.revisionEntrega.update({
            where: { id },
            data,
            include: INCLUDE_REVISION,
        }),

    eliminar: (id) => prisma.revisionEntrega.delete({ where: { id } }),
};
