import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { inscripcionMateriaRepositorio } from "../../../infrastructure/repositories/repositorioInscripcionMateria.js";

export async function eliminarInscripcionMateriaCasoUso(id) {
    const inscripcion = await inscripcionMateriaRepositorio.obtenerPorId(id);
    if (!inscripcion) throw crearError("Inscripción de materia no encontrada", 404);
    return inscripcionMateriaRepositorio.eliminar(id);
}
