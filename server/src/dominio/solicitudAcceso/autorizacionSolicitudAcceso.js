import {
    esDirectorDirectivoDeProyectoMateria,
    esDocenteVigenteDeProyectoMateria,
} from "../comun/autoridadProyectoPeriodo.js";
import { crearError } from "./helpersSolicitudAcceso.js";

function nombreRol(usuario) {
    return String(usuario?.rol?.nombre || "").trim().toLowerCase();
}

export function esEstudiante(usuario) {
    return nombreRol(usuario) === "estudiante";
}

export async function validarAutoridadSolicitudAcceso(solicitud, usuario) {
    const rol = nombreRol(usuario);
    if (rol === "admin" || rol === "estudiante") {
        throw crearError("No tienes autoridad para resolver esta solicitud", 403);
    }

    if (!solicitud.proyectoMateriaId) {
        throw crearError("La solicitud no tiene un contexto académico resoluble", 409);
    }

    if (solicitud.proyecto.estado === "ACTIVO") {
        if (!solicitud.proyectoMateria.claseId) {
            throw crearError("El contexto activo no tiene una ClaseMateria asignada", 409);
        }
        const autorizado = rol === "docente"
            && await esDocenteVigenteDeProyectoMateria(solicitud.proyectoMateriaId, usuario.id);
        if (!autorizado) throw crearError("No tienes autoridad para resolver esta solicitud", 403);
        return;
    }

    if (["CERRADO", "INCONCLUSO"].includes(solicitud.proyecto.estado)) {
        const autorizado = rol === "director"
            && await esDirectorDirectivoDeProyectoMateria(solicitud.proyectoMateriaId, usuario);
        if (!autorizado) throw crearError("No tienes autoridad para resolver esta solicitud", 403);
        return;
    }

    throw crearError("El estado del proyecto no admite solicitudes de acceso documental", 409);
}
