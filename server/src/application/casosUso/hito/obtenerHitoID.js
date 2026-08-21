import { hitoRepositorio } from "../../../infrastructure/repositories/repositorioHito.js";
import { ensureIdPositivo, crearError } from "../../../dominio/hito/helpersHito.js";

export async function obtenerHitoCasoUso(idRaw) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const hito = await hitoRepositorio.obtenerPorId(id);
    if (!hito) throw crearError("El hito no existe", 404);

    return hito;
}
