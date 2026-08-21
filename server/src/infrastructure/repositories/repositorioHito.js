import { prisma } from "../db/prisma.client.js";

export const hitoRepositorio = {
    listarPorProyecto: (proyectoId) =>
        prisma.hitoProyecto.findMany({
            where: { proyectoId },
            orderBy: { orden: "asc" },
            include: {
                _count: { select: { entregas: true } },
            },
        }),

    obtenerPorId: (id) =>
        prisma.hitoProyecto.findUnique({
            where: { id },
            include: {
                proyecto: { select: { id: true, titulo: true, estado: true } },
                _count: { select: { entregas: true } },
            },
        }),

    crear: (data) => prisma.hitoProyecto.create({ data }),

    actualizar: (id, data) => prisma.hitoProyecto.update({ where: { id }, data }),

    eliminar: (id) => prisma.hitoProyecto.delete({ where: { id } }),
};
