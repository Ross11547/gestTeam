import { actualizarMiembro } from "../../../dominio/equipo/validacionEquipo.js";
import { crearError } from "../../../dominio/equipo/helpersEquipo.js";
import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";
import { puedeGestionarEquipo } from "./permisosEquipo.js";

export async function actualizarMiembroEquipoCasoUso(idRaw, usuarioIdRaw, payload, usuario) {
    const id = Number(idRaw);
    const usuarioId = Number(usuarioIdRaw);

    if (!Number.isInteger(id) || id <= 0) throw crearError("ID inválido");
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) throw crearError("usuarioId inválido");

    const equipo = await equipoRepositorio.obtenerPorId(id);
    if (!equipo) throw crearError("El equipo no existe", 404);

    if (!(await puedeGestionarEquipo(usuario, equipo))) {
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
