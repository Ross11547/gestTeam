import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { facultadRepositorio } from "../../../infrastructure/repositories/repositorioFacultad.js";

export async function obtenerFacultadCasoUso(id) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("id inválido", 400);

    const item = await facultadRepositorio.obtenerPorId(id);
    if (!item) throw crearError("Facultad no encontrada", 404);
    return item;
}
