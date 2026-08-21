import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { periodoAcademicoRepositorio } from "../../../infrastructure/repositories/repositorioPeriodoAcademico.js";

export async function obtenerPeriodoAcademicoCasoUso(id) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("id inválido", 400);

    const item = await periodoAcademicoRepositorio.obtenerPorId(id);
    if (!item) throw crearError("Periodo académico no encontrado", 404);
    return item;
}
