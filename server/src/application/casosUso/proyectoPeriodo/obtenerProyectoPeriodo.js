import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError, ensureIdPositivo } from "../../../dominio/comun/helpersComunes.js";
import { puedeVerProyectoPeriodo } from "../../../dominio/comun/autoridadProyectoPeriodo.js";

export async function obtenerProyectoPeriodoCasoUso(idRaw, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const pp = await prisma.proyectoPeriodo.findUnique({
        where: { id },
        include: {
            proyecto: { select: { id: true, titulo: true, descripcion: true, estado: true } },
            periodo: { select: { id: true, nombre: true, fechaIni: true, fechaFin: true } },
            proyectosMateria: {
                include: {
                    materia: { select: { id: true, nombre: true, codigo: true } },
                    clase: { select: { id: true, paralelo: true } },
                },
            },
            hitos: {
                orderBy: { hitoPeriodo: { orden: "asc" } },
                include: {
                    hitoPeriodo: { select: { id: true, orden: true, nombre: true, descripcion: true, pesoSugerido: true } },
                },
            },
            _count: { select: { equipos: true } },
        },
    });

    if (!pp) throw crearError("El ProyectoPeriodo no existe", 404);

    const autorizado = await puedeVerProyectoPeriodo(pp.id, usuario);
    if (!autorizado) throw crearError("No tienes permisos para ver este ProyectoPeriodo", 403);

    return {
        id: pp.id,
        proyectoId: pp.proyectoId,
        proyecto: pp.proyecto,
        periodoId: pp.periodoId,
        periodo: pp.periodo,
        estado: pp.estado,
        fechaInicio: pp.fechaInicio,
        fechaFin: pp.fechaFin,
        createdAt: pp.createdAt,
        proyectosMateria: pp.proyectosMateria,
        hitos: pp.hitos,
        equiposCount: pp._count.equipos,
    };
}
