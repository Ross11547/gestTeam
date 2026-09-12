import { crearError, ensureIdPositivo } from "../../../dominio/comun/helpersComunes.js";
import { puedeVerProyectoPeriodo } from "../../../dominio/comun/autoridadProyectoPeriodo.js";
import { obtenerContextoCierre } from "../proyectoPeriodo/obtenerContextoCierre.js";

export async function validarCierreProyectoCasoUso(proyectoIdRaw, proyectoPeriodoIdRaw, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const proyectoId = ensureIdPositivo(proyectoIdRaw);
    const proyectoPeriodoId = ensureIdPositivo(proyectoPeriodoIdRaw);
    if (!proyectoId || !proyectoPeriodoId) throw crearError("IDs inválidos", 400);

    const contextoCierre = await obtenerContextoCierre(proyectoPeriodoId);
    const { proyectoPeriodo, hitoFinal, idsCarrera, contextos, todosEvaluados } = contextoCierre;
    if (proyectoPeriodo.proyectoId !== proyectoId) {
        throw crearError("El ProyectoPeriodo no corresponde al proyecto", 400);
    }
    if (!(await puedeVerProyectoPeriodo(proyectoPeriodoId, usuario))) {
        throw crearError("No tienes permisos para consultar este cierre", 403);
    }

    const faltantes = [];
    if (!hitoFinal) faltantes.push({ tipo: "H5", mensaje: "No existe H5 para el ProyectoPeriodo" });
    for (const contexto of contextos) {
        if (!contexto.tieneEvaluacionH5) {
            faltantes.push({
                tipo: "EVALUACION_H5",
                proyectoMateriaId: contexto.proyectoMateriaId,
                mensaje: "Falta EvaluacionHito correspondiente a H5",
            });
        }
    }
    if (contextos.length === 0) {
        faltantes.push({ tipo: "CONTEXTO", mensaje: "No existen ProyectoMateria" });
    }
    if (idsCarrera.length > 1) {
        faltantes.push({ tipo: "INTERDISCIPLINARIO", mensaje: "El cierre entre varias carreras está pendiente" });
    }
    if (proyectoPeriodo.estado !== "CERRADO_PERIODO") {
        faltantes.push({ tipo: "PERIODO", mensaje: "El ProyectoPeriodo no está cerrado" });
    }
    if (proyectoPeriodo.proyecto.estado !== "ACTIVO") {
        faltantes.push({ tipo: "PROYECTO", mensaje: "El Proyecto no está ACTIVO" });
    }

    return {
        proyecto: proyectoPeriodo.proyecto,
        proyectoPeriodo: {
            id: proyectoPeriodo.id,
            periodo: proyectoPeriodo.periodo,
            estado: proyectoPeriodo.estado,
            fechaFin: proyectoPeriodo.fechaFin,
        },
        hitoFinal: hitoFinal
            ? { id: hitoFinal.id, estado: hitoFinal.estado, hitoPeriodo: hitoFinal.hitoPeriodo }
            : null,
        contextos,
        faltantes,
        puedeCerrar: proyectoPeriodo.proyecto.estado === "ACTIVO"
            && proyectoPeriodo.estado === "CERRADO_PERIODO"
            && idsCarrera.length === 1
            && todosEvaluados,
    };
}
