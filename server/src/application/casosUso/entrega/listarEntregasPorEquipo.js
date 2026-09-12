import { entregaRepositorio } from "../../../infrastructure/repositories/repositorioEntrega.js";
import { ensureIdPositivo, crearError } from "../../../dominio/entrega/helpersEntrega.js";
import { puedeVerEquipo } from "../../../dominio/comun/autoridadProyecto.js";
import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";

export async function listarEntregasPorEquipoCasoUso(query = {}, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const equipoId = ensureIdPositivo(query.equipoId);
    if (!equipoId) throw crearError("El parámetro equipoId es obligatorio");

    const equipo = await equipoRepositorio.obtenerPorId(equipoId);
    if (!equipo) throw crearError("El equipo no existe", 404);

    const autorizado = await puedeVerEquipo(usuario, equipo);
    if (!autorizado) throw crearError("No tienes permisos para ver entregas de este equipo", 403);

    return entregaRepositorio.listarPorEquipo(equipoId);
}
