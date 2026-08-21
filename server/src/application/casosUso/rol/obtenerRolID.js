import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { rolRepositorio } from "../../../infrastructure/repositories/repositorioRol.js";

export async function obtenerRolCasoUso(id) {
    const rol = await rolRepositorio.obtenerPorId(id);
    if (!rol) throw crearError("Rol no encontrado", 404);
    return rol;
}
