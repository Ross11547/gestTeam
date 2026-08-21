import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { institucionRepositorio } from "../../../infrastructure/repositories/repositorioInstitucion.js";

export async function obtenerInstitucionCasoUso(id) {
    const institucion = await institucionRepositorio.obtenerPorId(id);
    if (!institucion) throw crearError("Institución no encontrada", 404);
    return institucion;
}
