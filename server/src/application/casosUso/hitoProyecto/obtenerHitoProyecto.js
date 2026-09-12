import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError, ensureIdPositivo } from "../../../dominio/comun/helpersComunes.js";
import { puedeVerHitoProyecto } from "../../../dominio/comun/autoridadRecursoAcademico.js";

export async function obtenerHitoProyectoCasoUso(idRaw, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const hito = await prisma.hitoProyecto.findUnique({
        where: { id },
        include: {
            proyectoPeriodo: {
                select: {
                    id: true,
                    proyecto: { select: { id: true, titulo: true } },
                    periodo: { select: { id: true, nombre: true } },
                },
            },
            hitoPeriodo: { select: { id: true, orden: true, nombre: true, descripcion: true, pesoSugerido: true } },
            _count: { select: { entregas: true, evaluaciones: true } },
        },
    });

    if (!hito) throw crearError("El HitoProyecto no existe", 404);

    const autorizado = await puedeVerHitoProyecto(hito.id, usuario);
    if (!autorizado) throw crearError("No tienes permisos para ver este hito", 403);

    return {
        id: hito.id,
        proyectoPeriodoId: hito.proyectoPeriodoId,
        proyectoPeriodo: hito.proyectoPeriodo,
        hitoPeriodoId: hito.hitoPeriodoId,
        hitoPeriodo: hito.hitoPeriodo,
        nombre: hito.nombre,
        descripcion: hito.descripcion,
        estado: hito.estado,
        fechaInicio: hito.fechaInicio,
        fechaFin: hito.fechaFin,
        createdAt: hito.createdAt,
        _count: hito._count,
    };
}
