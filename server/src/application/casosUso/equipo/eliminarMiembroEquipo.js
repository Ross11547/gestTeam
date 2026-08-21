import { crearError } from "../../../dominio/equipo/helpersEquipo.js";
import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";
import { puedeGestionarEquipo } from "./permisosEquipo.js";

export async function eliminarMiembroEquipoCasoUso(idRaw, usuarioIdRaw, usuario) {
    const id = Number(idRaw);
    const usuarioId = Number(usuarioIdRaw);

    if (!Number.isInteger(id) || id <= 0) throw crearError("ID inválido");
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) throw crearError("usuarioId inválido");

    const equipo = await equipoRepositorio.obtenerPorId(id);
    if (!equipo) throw crearError("El equipo no existe", 404);

    // Staff, creador o líder pueden remover a cualquiera;
    // un miembro común solo puede removerse a sí mismo.
    const esGestor = await puedeGestionarEquipo(usuario, equipo);

    if (!esGestor && usuario.id !== usuarioId) {
        throw crearError("No tienes permisos para remover a otro miembro", 403);
    }

    const existente = await equipoRepositorio.obtenerMiembro(id, usuarioId);
    if (!existente) throw crearError("El usuario no es miembro de este equipo", 404);

    return equipoRepositorio.eliminarMiembro(id, usuarioId);
}
