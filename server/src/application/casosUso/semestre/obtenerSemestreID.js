import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { semestreRepositorio } from "../../../infrastructure/repositories/repositorioSemestre.js";

export async function obtenerSemestreCasoUso(id) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("id inválido", 400);

    const item = await semestreRepositorio.obtenerPorId(id);
    if (!item) throw crearError("Semestre no encontrado", 404);
    return item;
}
