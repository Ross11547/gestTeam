import { crearError } from "../../../dominio/equipo/helpersEquipo.js";
import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";
import { esStaff } from "./permisosEquipo.js";

export async function eliminarEquipoCasoUso(idRaw, usuario) {
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0) throw crearError("ID inválido");

    const equipo = await equipoRepositorio.obtenerPorId(id);
    if (!equipo) throw crearError("El equipo no existe", 404);

    // Solo staff o el creador puede eliminar un equipo.
    if (!esStaff(usuario) && equipo.creadoPorId !== usuario.id) {
        throw crearError("No tienes permisos para eliminar este equipo", 403);
    }

    try {
        return await equipoRepositorio.eliminar(id);
    } catch (e) {
        if (e.code === "P2003") {
            throw crearError(
                "El equipo tiene entregas, pizarras u otros registros asociados",
                409
            );
        }
        throw e;
    }
}
