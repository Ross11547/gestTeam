import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError, ensureIdPositivo } from "../../../dominio/comun/helpersComunes.js";
import { puedeVerEvaluacionHito } from "../../../dominio/comun/autoridadRecursoAcademico.js";

export async function obtenerEvaluacionHitoCasoUso(idRaw, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const ev = await prisma.evaluacionHito.findUnique({
        where: { id },
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

    if (!ev) throw crearError("La EvaluacionHito no existe", 404);

    const autorizado = await puedeVerEvaluacionHito(ev.id, usuario);
    if (!autorizado) throw crearError("No tienes permisos para ver esta evaluación", 403);

    return {
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
        criteriosJson: ev.criteriosJson,
        createdAt: ev.createdAt,
    };
}
