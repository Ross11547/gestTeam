import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError } from "../../../dominio/comun/helpersComunes.js";

export async function obtenerContextoCierre(proyectoPeriodoId) {
    const proyectoPeriodo = await prisma.proyectoPeriodo.findUnique({
        where: { id: proyectoPeriodoId },
        include: {
            proyecto: { select: { id: true, titulo: true, estado: true } },
            periodo: { select: { id: true, nombre: true } },
            proyectosMateria: {
                include: {
                    materia: { select: { id: true, nombre: true, codigo: true, idCarrera: true } },
                    clase: { select: { id: true, docenteId: true } },
                },
                orderBy: { id: "asc" },
            },
            hitos: {
                where: { hitoPeriodo: { orden: 5 } },
                include: {
                    hitoPeriodo: { select: { id: true, orden: true, nombre: true } },
                    evaluaciones: { select: { id: true, proyectoMateriaId: true, evaluadorId: true } },
                },
            },
        },
    });

    if (!proyectoPeriodo) throw crearError("El ProyectoPeriodo no existe", 404);

    const hitoFinal = proyectoPeriodo.hitos[0] || null;
    const idsCarrera = [...new Set(
        proyectoPeriodo.proyectosMateria.map((contexto) => contexto.materia.idCarrera)
    )];
    const contextos = proyectoPeriodo.proyectosMateria.map((contexto) => {
        const evaluaciones = hitoFinal?.evaluaciones.filter(
            (evaluacion) => evaluacion.proyectoMateriaId === contexto.id
        ) || [];
        return {
            proyectoMateriaId: contexto.id,
            materia: contexto.materia,
            clase: contexto.clase,
            existeH5: Boolean(hitoFinal),
            tieneEvaluacionH5: evaluaciones.length > 0,
            evaluacionesH5: evaluaciones,
        };
    });

    return {
        proyectoPeriodo,
        hitoFinal,
        idsCarrera,
        contextos,
        todosEvaluados: contextos.length > 0
            && Boolean(hitoFinal)
            && contextos.every((contexto) => contexto.tieneEvaluacionH5),
    };
}

export function esDirectorDeCarrera(usuario, carreraId) {
    return String(usuario?.rol?.nombre || "").trim().toLowerCase() === "director"
        && Number(usuario?.idCarrera) === Number(carreraId);
}

export function esDocenteDeContexto(usuario, contexto) {
    return String(usuario?.rol?.nombre || "").trim().toLowerCase() === "docente"
        && contexto.clase?.docenteId === usuario?.id;
}

export function validarCarreraUnica(idsCarrera) {
    if (idsCarrera.length === 0) {
        throw crearError("El ProyectoPeriodo no tiene contextos académicos", 409);
    }
    if (idsCarrera.length > 1) {
        throw crearError("El cierre interdisciplinario entre varias carreras está pendiente", 409);
    }
    return idsCarrera[0];
}
