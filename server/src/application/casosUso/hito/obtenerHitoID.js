import { hitoRepositorio } from "../../../infrastructure/repositories/repositorioHito.js";
import { ensureIdPositivo, crearError } from "../../../dominio/hito/helpersHito.js";
import { puedeVerHitoProyecto } from "../../../dominio/comun/autoridadRecursoAcademico.js";

export async function obtenerHitoCasoUso(idRaw, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const hito = await hitoRepositorio.obtenerPorId(id);
    if (!hito) throw crearError("El hito no existe", 404);

    const autorizado = await puedeVerHitoProyecto(id, usuario);
    if (!autorizado) throw crearError("No tienes permisos para ver este hito", 403);

    return hito;
}
