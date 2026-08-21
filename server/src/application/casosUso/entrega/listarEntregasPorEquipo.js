import { entregaRepositorio } from "../../../infrastructure/repositories/repositorioEntrega.js";
import { ensureIdPositivo, crearError } from "../../../dominio/entrega/helpersEntrega.js";

export async function listarEntregasPorEquipoCasoUso(query = {}) {
    const equipoId = ensureIdPositivo(query.equipoId);
    if (!equipoId) throw crearError("El parámetro equipoId es obligatorio");

    return entregaRepositorio.listarPorEquipo(equipoId);
}
