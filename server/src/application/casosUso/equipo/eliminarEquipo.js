import { crearError } from "../../../dominio/equipo/helpersEquipo.js";
import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";
import { puedeGestionarEquipoAcademico } from "../../../dominio/comun/autoridadProyectoPeriodo.js";

export async function eliminarEquipoCasoUso(idRaw, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0) throw crearError("ID inválido");

    const equipo = await equipoRepositorio.obtenerPorId(id);
    if (!equipo) throw crearError("El equipo no existe", 404);

    const autorizado = await puedeGestionarEquipoAcademico(equipo, usuario);
    if (!autorizado) {
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
