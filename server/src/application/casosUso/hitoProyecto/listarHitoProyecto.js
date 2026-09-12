import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError, ensureIdPositivo } from "../../../dominio/comun/helpersComunes.js";
import { puedeVerProyectoPeriodo } from "../../../dominio/comun/autoridadProyectoPeriodo.js";

export async function listarHitoProyectoCasoUso(filtros = {}, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const proyectoPeriodoId = filtros.proyectoPeriodoId ? Number(filtros.proyectoPeriodoId) : null;
    if (!proyectoPeriodoId) throw crearError("proyectoPeriodoId es requerido", 400);

    const pp = await prisma.proyectoPeriodo.findUnique({
        where: { id: proyectoPeriodoId },
        select: { id: true },
    });
    if (!pp) throw crearError("El ProyectoPeriodo no existe", 404);

    const autorizado = await puedeVerProyectoPeriodo(proyectoPeriodoId, usuario);
    if (!autorizado) throw crearError("No tienes permisos para ver estos hitos", 403);

    const hitos = await prisma.hitoProyecto.findMany({
        where: { proyectoPeriodoId },
        orderBy: { hitoPeriodo: { orden: "asc" } },
        include: {
            hitoPeriodo: { select: { id: true, orden: true, nombre: true, descripcion: true, pesoSugerido: true } },
            _count: { select: { entregas: true, evaluaciones: true } },
        },
    });

    return hitos.map((h) => ({
        id: h.id,
        proyectoPeriodoId: h.proyectoPeriodoId,
        hitoPeriodoId: h.hitoPeriodoId,
        hitoPeriodo: h.hitoPeriodo,
        nombre: h.nombre,
        descripcion: h.descripcion,
        estado: h.estado,
        fechaInicio: h.fechaInicio,
        fechaFin: h.fechaFin,
        createdAt: h.createdAt,
        _count: h._count,
    }));
}
