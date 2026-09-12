import { prisma } from "../db/prisma.client.js";

export const proyectoRepositorio = {
    listarCatalogo: async ({ where, orderBy, skip, take, usuarioId }) => {
        const select = {
            id: true,
            titulo: true,
            descripcion: true,
            estado: true,
            tipoGrupo: true,
            createdAt: true,
            proyectoDestacado: {
                select: { id: true, motivo: true, orden: true },
            },
            proyectosMateria: {
                select: {
                    materia: {
                        select: {
                            id: true,
                            nombre: true,
                            codigo: true,
                            esIntegrador: true,
                            carrera: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    facultad: { select: { id: true, nombre: true } },
                                },
                            },
                        },
                    },
                    periodo: { select: { id: true, nombre: true } },
                },
            },
            miembros: {
                where: { usuarioId },
                select: { id: true },
            },
            equipos: {
                where: { miembros: { some: { usuarioId, activo: true } } },
                select: { id: true },
            },
            periodos: {
                select: {
                    id: true,
                    createdAt: true,
                    periodo: {
                        select: { activo: true, fechaIni: true, fechaFin: true },
                    },
                    proyectosMateria: {
                        select: {
                            clase: { select: { docenteId: true } },
                            materia: { select: { idCarrera: true } },
                        },
                    },
                    equipos: {
                        where: { miembros: { some: { usuarioId } } },
                        select: {
                            miembros: {
                                where: { usuarioId },
                                select: { id: true },
                            },
                        },
                    },
                },
            },
        };

        const [total, proyectos] = await prisma.$transaction([
            prisma.proyecto.count({ where }),
            prisma.proyecto.findMany({ where, orderBy, skip, take, select }),
        ]);
        return { total, proyectos };
    },

    obtenerCatalogoPorId: (id, usuarioId, where) =>
        prisma.proyecto.findFirst({
            where: { AND: [{ id }, where] },
            select: {
                id: true,
                titulo: true,
                descripcion: true,
                estado: true,
                tipoGrupo: true,
                createdAt: true,
                proyectoDestacado: {
                    select: { id: true, motivo: true, orden: true },
                },
                proyectosMateria: {
                    select: {
                        materia: {
                            select: {
                                id: true,
                                nombre: true,
                                codigo: true,
                                esIntegrador: true,
                                carrera: {
                                    select: {
                                        id: true,
                                        nombre: true,
                                        facultad: { select: { id: true, nombre: true } },
                                    },
                                },
                            },
                        },
                        periodo: { select: { id: true, nombre: true } },
                    },
                },
                miembros: { where: { usuarioId }, select: { id: true } },
                equipos: {
                    where: { miembros: { some: { usuarioId, activo: true } } },
                    select: { id: true },
                },
                periodos: {
                    select: {
                        id: true,
                        createdAt: true,
                        periodo: { select: { activo: true, fechaIni: true, fechaFin: true } },
                        proyectosMateria: {
                            select: {
                                clase: { select: { docenteId: true } },
                                materia: { select: { idCarrera: true } },
                            },
                        },
                        equipos: {
                            where: { miembros: { some: { usuarioId } } },
                            select: { miembros: { where: { usuarioId }, select: { id: true } } },
                        },
                    },
                },
            },
        }),

    listarInscripcionesActivas: (usuarioId) =>
        prisma.inscripcionMateria.findMany({
            where: { usuarioId, periodo: { activo: true } },
            select: {
                periodoId: true,
                materiaId: true,
                claseId: true,
                clase: { select: { activo: true, periodoId: true, materiaId: true } },
            },
        }),

    listarCatalogoIntegradores: (where) =>
        prisma.proyecto.findMany({
            where,
            orderBy: { titulo: "asc" },
            select: {
                id: true,
                titulo: true,
                descripcion: true,
                estado: true,
                proyectosMateria: {
                    where: { materia: { esIntegrador: true } },
                    select: {
                        periodo: { select: { id: true, nombre: true } },
                        materia: { select: { id: true, nombre: true, codigo: true } },
                    },
                    orderBy: { id: "asc" },
                },
            },
        }),

    listar: (where = {}) =>
        prisma.proyecto.findMany({
            where,
            orderBy: { id: "asc" },
            include: {
                _count: {
                    select: {
                        miembros: true,
                        hitos: true,
                        equipos: true,
                        solicitudAccesoProyectos: true,
                        pizarras: true,
                    },
                },
            },
        }),

    obtenerPorId: (id) =>
        prisma.proyecto.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        miembros: true,
                        hitos: true,
                        equipos: true,
                        solicitudAccesoProyectos: true,
                        pizarras: true,
                    },
                },
            },
        }),

    crear: (data) =>
        prisma.proyecto.create({
            data,
            include: {
                _count: {
                    select: {
                        miembros: true,
                        hitos: true,
                        equipos: true,
                        solicitudAccesoProyectos: true,
                        pizarras: true,
                    },
                },
            },
        }),

    actualizar: (id, data) =>
        prisma.proyecto.update({
            where: { id },
            data,
            include: {
                _count: {
                    select: {
                        miembros: true,
                        hitos: true,
                        equipos: true,
                        solicitudAccesoProyectos: true,
                        pizarras: true,
                    },
                },
            },
        }),

    eliminar: (id) => prisma.proyecto.delete({ where: { id } }),
};
