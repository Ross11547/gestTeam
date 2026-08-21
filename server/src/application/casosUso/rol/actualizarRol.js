import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { actualizarRol } from "../../../dominio/rol/validacionRol.js";
import { normalizarNombreRol } from "../../../dominio/rol/helpersRol.js";
import { rolRepositorio } from "../../../infrastructure/repositories/repositorioRol.js";

export async function actualizarRolCasoUso(id, payload) {
    const actual = await rolRepositorio.obtenerPorId(id);
    if (!actual) throw crearError("Rol no encontrado", 404);

    const body = actualizarRol.parse(payload);

    const data = {};
    if (body.nombre !== undefined) {
        const nombre = normalizarNombreRol(body.nombre);
        const dup = await rolRepositorio.existePorNombre(nombre, id);
        if (dup) throw crearError("El nombre del rol ya está en uso", 409);
        data.nombre = nombre;
    }

    if (Object.keys(data).length === 0) return actual;

    return rolRepositorio.actualizar(id, data);
}
