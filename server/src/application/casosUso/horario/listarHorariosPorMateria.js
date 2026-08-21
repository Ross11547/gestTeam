import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { horarioRepositorio } from "../../../infrastructure/repositories/repositorioHorario.js";

export async function listarHorarioPorMateriaCasoUso(materiaId) {
    if (!Number.isInteger(materiaId) || materiaId <= 0) throw crearError("materiaId requerido", 400);
    return horarioRepositorio.listarPorMateria(materiaId);
}
