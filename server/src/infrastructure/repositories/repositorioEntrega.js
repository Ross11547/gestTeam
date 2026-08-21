import { prisma } from "../db/prisma.client.js";

const INCLUDE_ENTREGA = {
    hito: { select: { id: true, nombre: true, orden: true, fechaFin: true } },
    equipo: { select: { id: true, nombre: true, proyectoId: true } },
    autor: {
        select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
        },
    },
    _count: { select: { revisiones: true, documentos: true } },
};

export const entregaRepositorio = {
    listarPorHito: (hitoId) =>
        prisma.entregaHito.findMany({
            where: { hitoId },
            orderBy: { createdAt: "desc" },
            include: INCLUDE_ENTREGA,
        }),

    listarPorEquipo: (equipoId) =>
        prisma.entregaHito.findMany({
            where: { equipoId },
            orderBy: { createdAt: "desc" },
            include: INCLUDE_ENTREGA,
        }),

    obtenerPorId: (id) =>
        prisma.entregaHito.findUnique({
            where: { id },
            include: {
                ...INCLUDE_ENTREGA,
                revisiones: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        revisor: {
                            select: { id: true, nombre: true, apellido: true },
                        },
                    },
                },
            },
        }),

    crear: (data) =>
        prisma.entregaHito.create({
            data,
            include: INCLUDE_ENTREGA,
        }),

    actualizar: (id, data) =>
        prisma.entregaHito.update({
            where: { id },
            data,
            include: INCLUDE_ENTREGA,
        }),

    eliminar: (id) => prisma.entregaHito.delete({ where: { id } }),
};
