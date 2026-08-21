import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { materiaRepositorio } from "../../../infrastructure/repositories/repositorioMateria.js";

export async function obtenerMateriaCasoUso(id) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("ID inválido", 400);

    const item = await materiaRepositorio.obtenerPorId(id);
    if (!item) throw crearError("Materia no encontrada", 404);
    return item;
}
