import { agregarMiembro } from "../../../dominio/equipo/validacionEquipo.js";
import { crearError } from "../../../dominio/equipo/helpersEquipo.js";
import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { puedeGestionarEquipoAcademico } from "../../../dominio/comun/autoridadProyectoPeriodo.js";

export async function agregarMiembroEquipoCasoUso(idRaw, payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0) throw crearError("ID inválido");

    const equipo = await equipoRepositorio.obtenerPorId(id);
    if (!equipo) throw crearError("El equipo no existe", 404);

    if (!(await puedeGestionarEquipoAcademico(equipo, usuario))) {
        throw crearError("No tienes permisos para agregar miembros a este equipo", 403);
    }

    const data = agregarMiembro.parse(payload);

    const nuevoMiembro = await prisma.usuario.findUnique({
        where: { id: data.usuarioId },
        select: { id: true, activo: true },
    });

    if (!nuevoMiembro || !nuevoMiembro.activo) {
        throw crearError("El usuario indicado no existe o está inactivo", 404);
    }

    const existente = await equipoRepositorio.obtenerMiembro(id, data.usuarioId);

    if (existente && existente.activo) {
        throw crearError("El usuario ya es miembro de este equipo", 409);
    }

    try {
        if (existente && !existente.activo) {
            return await equipoRepositorio.actualizarMiembro(id, data.usuarioId, {
                activo: true,
                rolEquipo: data.rolEquipo ?? existente.rolEquipo,
            });
        }

        return await equipoRepositorio.agregarMiembro({
            equipoId: id,
            usuarioId: data.usuarioId,
            rolEquipo: data.rolEquipo ?? undefined,
        });
    } catch (e) {
        if (e.code === "P2002") {
            throw crearError("El usuario ya es miembro de este equipo", 409);
        }
        throw e;
    }
}
