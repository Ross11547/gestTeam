import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { proyectoRepositorio } from "../../../infrastructure/repositories/repositorioProyecto.js";

export async function obtenerProyectoCasoUso(id) {
    const proyecto = await proyectoRepositorio.obtenerPorId(id);
    if (!proyecto) throw crearError("Proyecto no encontrado", 404);
    return proyecto;
}
