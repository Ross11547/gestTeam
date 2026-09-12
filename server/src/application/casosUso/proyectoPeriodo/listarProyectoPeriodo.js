import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { puedeVerProyectoPeriodo } from "../../../dominio/comun/autoridadProyectoPeriodo.js";

export async function listarProyectoPeriodoCasoUso(filtros = {}, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const where = {};
    if (filtros.proyectoId) where.proyectoId = Number(filtros.proyectoId);
    if (filtros.periodoId) where.periodoId = Number(filtros.periodoId);

    const registros = await prisma.proyectoPeriodo.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            proyecto: { select: { id: true, titulo: true, estado: true } },
            periodo: { select: { id: true, nombre: true } },
            _count: { select: { proyectosMateria: true, equipos: true, hitos: true } },
        },
    });

    const visibles = [];
    for (const pp of registros) {
        if (await puedeVerProyectoPeriodo(pp.id, usuario)) {
            visibles.push({
                id: pp.id,
                proyectoId: pp.proyectoId,
                proyecto: pp.proyecto,
                periodoId: pp.periodoId,
                periodo: pp.periodo,
                estado: pp.estado,
                fechaInicio: pp.fechaInicio,
                fechaFin: pp.fechaFin,
                createdAt: pp.createdAt,
                _count: pp._count,
            });
        }
    }

    return visibles;
}
