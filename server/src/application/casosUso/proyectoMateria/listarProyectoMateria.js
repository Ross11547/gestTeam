import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError, ensureIdPositivo } from "../../../dominio/comun/helpersComunes.js";
import { puedeVerProyectoPeriodo, puedeVerProyectoMateria } from "../../../dominio/comun/autoridadProyectoPeriodo.js";

export async function listarProyectoMateriaCasoUso(filtros = {}, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const proyectoPeriodoId = filtros.proyectoPeriodoId ? Number(filtros.proyectoPeriodoId) : null;
    if (!proyectoPeriodoId) throw crearError("proyectoPeriodoId es requerido", 400);

    const pp = await prisma.proyectoPeriodo.findUnique({
        where: { id: proyectoPeriodoId },
        select: { id: true },
    });
    if (!pp) throw crearError("El ProyectoPeriodo no existe", 404);

    const autorizado = await puedeVerProyectoPeriodo(proyectoPeriodoId, usuario);
    if (!autorizado) throw crearError("No tienes permisos para ver este contexto", 403);

    const registros = await prisma.proyectoMateria.findMany({
        where: { proyectoPeriodoId },
        include: {
            materia: { select: { id: true, nombre: true, codigo: true } },
            clase: { select: { id: true, paralelo: true } },
            proyectoPeriodo: {
                select: {
                    id: true,
                    proyecto: { select: { id: true, titulo: true } },
                    periodo: { select: { id: true, nombre: true } },
                },
            },
            _count: { select: { equipos: true, evaluacionesHito: true } },
        },
    });

    const visibles = [];
    for (const pm of registros) {
        if (await puedeVerProyectoMateria(pm.id, usuario)) {
            visibles.push({
                id: pm.id,
                proyectoPeriodoId: pm.proyectoPeriodoId,
                proyectoPeriodo: pm.proyectoPeriodo,
                materia: pm.materia,
                clase: pm.clase,
                createdAt: pm.createdAt,
                _count: pm._count,
            });
        }
    }

    return visibles;
}
