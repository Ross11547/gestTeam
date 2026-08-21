import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { rolRepositorio } from "../../../infrastructure/repositories/repositorioRol.js";

export async function eliminarRolCasoUso(id) {
    const rol = await rolRepositorio.obtenerPorId(id);
    if (!rol) throw crearError("Rol no encontrado", 404);

    const usuarios = await rolRepositorio.contarUsuarios(id);
    if (usuarios > 0) {
        throw crearError("No se puede eliminar el rol porque tiene usuarios asignados", 409);
    }

    return rolRepositorio.eliminar(id);
}
