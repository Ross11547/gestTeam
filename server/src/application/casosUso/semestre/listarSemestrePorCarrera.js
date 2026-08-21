import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { semestreRepositorio } from "../../../infrastructure/repositories/repositorioSemestre.js";

export async function listarSemestrePorCarreraCasoUso(carreraId) {
    if (!Number.isInteger(carreraId) || carreraId <= 0) throw crearError("carreraId válido es requerido", 400);
    return semestreRepositorio.listarPorCarrera(carreraId);
}
