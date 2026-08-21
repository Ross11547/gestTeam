import { actualizarEquipo } from "../../../dominio/equipo/validacionEquipo.js";
import { normalizarTexto, crearError } from "../../../dominio/equipo/helpersEquipo.js";
import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";
import { puedeGestionarEquipo } from "./permisosEquipo.js";

export async function actualizarEquipoCasoUso(idRaw, payload, usuario) {
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0) throw crearError("ID inválido");

    const equipo = await equipoRepositorio.obtenerPorId(id);
    if (!equipo) throw crearError("El equipo no existe", 404);

    if (!(await puedeGestionarEquipo(usuario, equipo))) {
        throw crearError("No tienes permisos para modificar este equipo", 403);
    }

    const data = actualizarEquipo.parse(payload);

    return equipoRepositorio.actualizar(id, {
        nombre: data.nombre !== undefined ? normalizarTexto(data.nombre) : undefined,
        tipoGrupo: data.tipoGrupo,
        materiaId: data.materiaId,
        periodoId: data.periodoId,
        claseId: data.claseId,
    });
}
