import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { proyectoRepositorio } from "../../../infrastructure/repositories/repositorioProyecto.js";
import { puedeVerProyecto } from "../../../dominio/comun/autoridadProyecto.js";

export async function obtenerProyectoCasoUso(id, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const proyecto = await proyectoRepositorio.obtenerPorId(id);
    if (!proyecto) throw crearError("Proyecto no encontrado", 404);

    const autorizado = await puedeVerProyecto(proyecto.id, usuario);
    if (!autorizado) throw crearError("No tienes permisos para ver este proyecto", 403);

    return proyecto;
}
