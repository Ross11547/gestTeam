import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { horarioRepositorio } from "../../../infrastructure/repositories/repositorioHorario.js";

export async function obtenerHorarioCasoUso(id) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("ID inválido", 400);

    const item = await horarioRepositorio.obtenerPorId(id);
    if (!item) throw crearError("Horario no encontrado", 404);
    return item;
}
