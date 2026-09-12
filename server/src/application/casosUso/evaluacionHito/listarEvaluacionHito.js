import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError, ensureIdPositivo } from "../../../dominio/comun/helpersComunes.js";
import { puedeVerEvaluacionHito } from "../../../dominio/comun/autoridadRecursoAcademico.js";

export async function listarEvaluacionHitoCasoUso(filtros = {}, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const where = {};
    if (filtros.hitoProyectoId) where.hitoProyectoId = Number(filtros.hitoProyectoId);
    if (filtros.proyectoMateriaId) where.proyectoMateriaId = Number(filtros.proyectoMateriaId);

    if (!where.hitoProyectoId && !where.proyectoMateriaId) {
        throw crearError("Se requiere hitoProyectoId o proyectoMateriaId", 400);
    }

    const registros = await prisma.evaluacionHito.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            hitoProyecto: {
                select: {
                    id: true,
                    proyectoPeriodoId: true,
                    hitoPeriodo: { select: { id: true, orden: true, nombre: true } },
                },
            },
            proyectoMateria: {
                select: {
                    id: true,
                    materia: { select: { id: true, nombre: true, codigo: true } },
                },
            },
            evaluador: { select: { id: true, nombre: true, apellido: true, correo: true } },
        },
    });

    const visibles = [];
    for (const ev of registros) {
        if (await puedeVerEvaluacionHito(ev.id, usuario)) {
            visibles.push({
                id: ev.id,
                hitoProyectoId: ev.hitoProyectoId,
                hitoProyecto: ev.hitoProyecto,
                proyectoMateriaId: ev.proyectoMateriaId,
                proyectoMateria: ev.proyectoMateria,
                evaluadorId: ev.evaluadorId,
                evaluador: ev.evaluador,
                tipoEvaluador: ev.tipoEvaluador,
                puntaje: ev.puntaje,
                comentario: ev.comentario,
                createdAt: ev.createdAt,
            });
        }
    }

    return visibles;
}
