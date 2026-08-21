import { hitoRepositorio } from "../../../infrastructure/repositories/repositorioHito.js";
import { ensureIdPositivo, crearError } from "../../../dominio/hito/helpersHito.js";

export async function listarHitosPorProyectoCasoUso(query = {}) {
    const proyectoId = ensureIdPositivo(query.proyectoId);
    if (!proyectoId) throw crearError("El parámetro proyectoId es obligatorio");

    return hitoRepositorio.listarPorProyecto(proyectoId);
}
