import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";
import { ensureIdPositivo, crearError } from "../../../dominio/equipo/helpersEquipo.js";

export async function listarMiembrosEquipoCasoUso(idRaw) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const equipo = await equipoRepositorio.obtenerPorId(id);
    if (!equipo) throw crearError("El equipo no existe", 404);

    return equipoRepositorio.listarMiembros(id);
}
