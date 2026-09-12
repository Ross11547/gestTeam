import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";
import { ensureIdPositivo, crearError } from "../../../dominio/equipo/helpersEquipo.js";
import { puedeVerEquipoAcademico } from "../../../dominio/comun/autoridadProyectoPeriodo.js";

export async function listarMiembrosEquipoCasoUso(idRaw, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const equipo = await equipoRepositorio.obtenerPorId(id);
    if (!equipo) throw crearError("El equipo no existe", 404);

    const autorizado = await puedeVerEquipoAcademico(equipo, usuario);
    if (!autorizado) throw crearError("No tienes permisos para ver este equipo", 403);

    return equipoRepositorio.listarMiembros(id);
}
