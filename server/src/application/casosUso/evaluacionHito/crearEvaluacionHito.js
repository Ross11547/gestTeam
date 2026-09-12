import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { crearEvaluacionHitoSchema } from "../../../dominio/academico/validacionAcademico.js";
import { evaluacionHitoRepositorio } from "../../../infrastructure/repositories/repositorioEvaluacionHito.js";
import { hitoProyectoRepositorio } from "../../../infrastructure/repositories/repositorioHitoProyecto.js";
import { puedeCrearEvaluacionHito } from "../../../dominio/comun/autoridadRecursoAcademico.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function crearEvaluacionHitoCasoUso(payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const data = crearEvaluacionHitoSchema.parse(payload);

    const hitoProyecto = await hitoProyectoRepositorio.obtenerPorId(data.hitoProyectoId);
    if (!hitoProyecto) throw crearError("El HitoProyecto no existe", 404);

    const proyectoMateria = await prisma.proyectoMateria.findUnique({
        where: { id: data.proyectoMateriaId },
        include: {
            proyectoPeriodo: {
                include: {
                    proyecto: { select: { id: true } },
                    periodo: { select: { id: true } },
                },
            },
        },
    });
    if (!proyectoMateria) throw crearError("El ProyectoMateria no existe", 404);

    const hpProyectoId = hitoProyecto.proyectoPeriodo?.proyecto?.id;
    const hpPeriodoId = hitoProyecto.proyectoPeriodo?.periodo?.id;
    const pmProyectoId = proyectoMateria.proyectoPeriodo?.proyecto?.id;
    const pmPeriodoId = proyectoMateria.proyectoPeriodo?.periodo?.id;
    const hpProyectoPeriodoId = hitoProyecto.proyectoPeriodoId;
    const pmProyectoPeriodoId = proyectoMateria.proyectoPeriodoId;

    if (hpProyectoPeriodoId !== pmProyectoPeriodoId) {
        throw crearError("El HitoProyecto y el ProyectoMateria deben pertenecer al mismo ProyectoPeriodo", 400);
    }
    if (hpProyectoId !== pmProyectoId) {
        throw crearError("El HitoProyecto y el ProyectoMateria deben pertenecer al mismo Proyecto", 400);
    }
    if (hpPeriodoId !== pmPeriodoId) {
        throw crearError("El HitoProyecto y el ProyectoMateria deben pertenecer al mismo Periodo", 400);
    }

    const autorizado = await puedeCrearEvaluacionHito(data.hitoProyectoId, data.proyectoMateriaId, usuario);
    if (!autorizado) throw crearError("No tienes permisos para evaluar este hito", 403);

    const evaluador = await prisma.usuario.findUnique({
        where: { id: data.evaluadorId },
        select: { id: true },
    });
    if (!evaluador) throw crearError("El evaluador no existe", 404);

    return evaluacionHitoRepositorio.crear({
        hitoProyectoId: data.hitoProyectoId,
        proyectoMateriaId: data.proyectoMateriaId,
        evaluadorId: data.evaluadorId,
        tipoEvaluador: data.tipoEvaluador,
        puntaje: data.puntaje ?? null,
        comentario: data.comentario ?? null,
    });
}
