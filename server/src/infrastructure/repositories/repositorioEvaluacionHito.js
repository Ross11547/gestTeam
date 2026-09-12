import { prisma } from "../db/prisma.client.js";

export const evaluacionHitoRepositorio = {
    crear: (data) =>
        prisma.evaluacionHito.create({
            data,
            include: {
                hitoProyecto: { select: { id: true } },
                proyectoMateria: {
                    include: {
                        proyectoPeriodo: {
                            include: {
                                proyecto: { select: { id: true, titulo: true } },
                                periodo: { select: { id: true, nombre: true } },
                            },
                        },
                        materia: { select: { id: true, nombre: true } },
                    },
                },
            },
        }),

    obtenerPorId: (id) =>
        prisma.evaluacionHito.findUnique({
            where: { id },
            include: {
                hitoProyecto: {
                    include: {
                        proyectoPeriodo: {
                            include: {
                                proyecto: { select: { id: true } },
                                periodo: { select: { id: true } },
                            },
                        },
                        hitoPeriodo: { select: { id: true, orden: true } },
                    },
                },
                proyectoMateria: {
                    include: {
                        proyectoPeriodo: {
                            include: {
                                proyecto: { select: { id: true } },
                                periodo: { select: { id: true } },
                            },
                        },
                    },
                },
            },
        }),
};
