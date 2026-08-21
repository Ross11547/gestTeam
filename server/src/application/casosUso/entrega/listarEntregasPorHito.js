import { entregaRepositorio } from "../../../infrastructure/repositories/repositorioEntrega.js";
import { ensureIdPositivo, crearError } from "../../../dominio/entrega/helpersEntrega.js";

export async function listarEntregasPorHitoCasoUso(query = {}) {
    const hitoId = ensureIdPositivo(query.hitoId);
    if (!hitoId) throw crearError("El parámetro hitoId es obligatorio");

    return entregaRepositorio.listarPorHito(hitoId);
}
