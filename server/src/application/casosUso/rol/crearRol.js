import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { crearRol } from "../../../dominio/rol/validacionRol.js";
import { normalizarNombreRol } from "../../../dominio/rol/helpersRol.js";
import { rolRepositorio } from "../../../infrastructure/repositories/repositorioRol.js";

export async function crearRolCasoUso(payload) {
    const body = crearRol.parse(payload);
    const nombre = normalizarNombreRol(body.nombre);

    const yaExiste = await rolRepositorio.existePorNombre(nombre);
    if (yaExiste) throw crearError("El rol ya existe", 409);

    return rolRepositorio.crear({ nombre });
}
