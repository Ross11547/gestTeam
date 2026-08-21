import { prisma } from "../db/prisma.client.js";

const INCLUDE_EQUIPO = {
    proyecto: { select: { id: true, titulo: true, estado: true } },
    materia: { select: { id: true, nombre: true, codigo: true } },
    periodo: { select: { id: true, nombre: true } },
    _count: { select: { miembros: true, entregas: true, pizarras: true } },
};

const INCLUDE_MIEMBROS = {
    miembros: {
        include: {
            usuario: {
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    correo: true,
                    activo: true,
                    rol: { select: { id: true, nombre: true } },
                },
            },
        },
        orderBy: { joinedAt: "asc" },
    },
};

export const equipoRepositorio = {
    listar: (filtros = {}) =>
        prisma.equipo.findMany({
            where: filtros,
            orderBy: { id: "asc" },
            include: INCLUDE_EQUIPO,
        }),

    obtenerPorId: (id) =>
        prisma.equipo.findUnique({
            where: { id },
            include: { ...INCLUDE_EQUIPO, ...INCLUDE_MIEMBROS },
        }),

    crearConLider: (data, liderId) =>
        prisma.$transaction(async (tx) => {
            const equipo = await tx.equipo.create({
                data,
                include: INCLUDE_EQUIPO,
            });

            await tx.equipoMiembro.create({
                data: { equipoId: equipo.id, usuarioId: liderId, rolEquipo: "LIDER" },
            });

            return equipo;
        }),

    actualizar: (id, data) =>
        prisma.equipo.update({
            where: { id },
            data,
            include: INCLUDE_EQUIPO,
        }),

    eliminar: (id) => prisma.equipo.delete({ where: { id } }),

    listarMiembros: (equipoId) =>
        prisma.equipoMiembro.findMany({
            where: { equipoId },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        correo: true,
                        activo: true,
                        rol: { select: { id: true, nombre: true } },
                    },
                },
            },
            orderBy: { joinedAt: "asc" },
        }),

    obtenerMiembro: (equipoId, usuarioId) =>
        prisma.equipoMiembro.findUnique({
            where: { equipoId_usuarioId: { equipoId, usuarioId } },
        }),

    agregarMiembro: (data) =>
        prisma.equipoMiembro.create({
            data,
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        correo: true,
                        rol: { select: { id: true, nombre: true } },
                    },
                },
            },
        }),

    actualizarMiembro: (equipoId, usuarioId, data) =>
        prisma.equipoMiembro.update({
            where: { equipoId_usuarioId: { equipoId, usuarioId } },
            data,
        }),

    eliminarMiembro: (equipoId, usuarioId) =>
        prisma.equipoMiembro.delete({
            where: { equipoId_usuarioId: { equipoId, usuarioId } },
        }),
};
