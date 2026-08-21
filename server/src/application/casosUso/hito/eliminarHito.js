import { crearError, ensureIdPositivo } from "../../../dominio/hito/helpersHito.js";
import { hitoRepositorio } from "../../../infrastructure/repositories/repositorioHito.js";

export async function eliminarHitoCasoUso(idRaw) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const hito = await hitoRepositorio.obtenerPorId(id);
    if (!hito) throw crearError("El hito no existe", 404);

    try {
        return await hitoRepositorio.eliminar(id);
    } catch (e) {
        if (e.code === "P2003") {
            throw crearError("El hito tiene entregas asociadas", 409);
        }
        throw e;
    }
}
