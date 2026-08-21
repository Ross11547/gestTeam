import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { institucionRepositorio } from "../../../infrastructure/repositories/repositorioInstitucion.js";

export async function eliminarInstitucionCasoUso(id) {
    const actual = await institucionRepositorio.obtenerPorId(id);
    if (!actual) throw crearError("Institución no encontrada", 404);
    return institucionRepositorio.eliminar(id);
}
