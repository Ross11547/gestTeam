import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError, ensureIdPositivo } from "../../../dominio/comun/helpersComunes.js";
import { puedeVerProyectoMateria } from "../../../dominio/comun/autoridadProyectoPeriodo.js";

export async function obtenerProyectoMateriaCasoUso(idRaw, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const pm = await prisma.proyectoMateria.findUnique({
        where: { id },
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

    if (!pm) throw crearError("El ProyectoMateria no existe", 404);

    const autorizado = await puedeVerProyectoMateria(pm.id, usuario);
    if (!autorizado) throw crearError("No tienes permisos para ver este contexto", 403);

    return {
        id: pm.id,
        proyectoPeriodoId: pm.proyectoPeriodoId,
        proyectoPeriodo: pm.proyectoPeriodo,
        materia: pm.materia,
        clase: pm.clase,
        createdAt: pm.createdAt,
        equiposCount: pm._count.equipos,
        evaluacionesHitoCount: pm._count.evaluacionesHito,
    };
}
