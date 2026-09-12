import { actualizarMiembro } from "../../../dominio/equipo/validacionEquipo.js";
import { crearError } from "../../../dominio/equipo/helpersEquipo.js";
import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";
import { puedeGestionarEquipoAcademico } from "../../../dominio/comun/autoridadProyectoPeriodo.js";

export async function actualizarMiembroEquipoCasoUso(idRaw, usuarioIdRaw, payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = Number(idRaw);
    const usuarioId = Number(usuarioIdRaw);

    if (!Number.isInteger(id) || id <= 0) throw crearError("ID inválido");
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) throw crearError("usuarioId inválido");

    const equipo = await equipoRepositorio.obtenerPorId(id);
    if (!equipo) throw crearError("El equipo no existe", 404);

    if (!(await puedeGestionarEquipoAcademico(equipo, usuario))) {
        throw crearError("No tienes permisos para modificar los miembros de este equipo", 403);
    }

    const existente = await equipoRepositorio.obtenerMiembro(id, usuarioId);
    if (!existente) throw crearError("El usuario no es miembro de este equipo", 404);

    const data = actualizarMiembro.parse(payload);

    return equipoRepositorio.actualizarMiembro(id, usuarioId, {
        rolEquipo: data.rolEquipo,
        activo: data.activo,
    });
}
