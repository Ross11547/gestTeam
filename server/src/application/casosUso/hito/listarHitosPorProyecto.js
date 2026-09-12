import { hitoRepositorio } from "../../../infrastructure/repositories/repositorioHito.js";
import { ensureIdPositivo, crearError } from "../../../dominio/hito/helpersHito.js";
import { puedeVerProyecto } from "../../../dominio/comun/autoridadProyecto.js";

export async function listarHitosPorProyectoCasoUso(query = {}, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const proyectoId = ensureIdPositivo(query.proyectoId);
    if (!proyectoId) throw crearError("El parámetro proyectoId es obligatorio");

    const autorizado = await puedeVerProyecto(proyectoId, usuario);
    if (!autorizado) throw crearError("No tienes permisos para ver los hitos de este proyecto", 403);

    return hitoRepositorio.listarPorProyecto(proyectoId);
}
