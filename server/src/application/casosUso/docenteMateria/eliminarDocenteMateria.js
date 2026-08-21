import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { docenteMateriaRepositorio } from "../../../infrastructure/repositories/repositorioDocenteMateria.js";

export async function eliminarDocenteMateriaCasoUso(id) {
    const registro = await docenteMateriaRepositorio.obtenerPorId(id);
    if (!registro) throw crearError("Asignación docente materia no encontrada", 404);
    return docenteMateriaRepositorio.eliminar(id);
}
