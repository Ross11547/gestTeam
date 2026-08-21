import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { carreraRepositorio } from "../../../infrastructure/repositories/repositorioCarrera.js";

export async function obtenerCarreraCasoUso(id) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("id inválido", 400);

    const item = await carreraRepositorio.obtenerPorId(id);
    if (!item) throw crearError("Carrera no encontrada", 404);
    return item;
}
