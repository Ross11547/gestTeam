import { actualizarHito } from "../../../dominio/hito/validacionHito.js";
import { normalizarTexto, crearError, ensureIdPositivo } from "../../../dominio/hito/helpersHito.js";
import { hitoRepositorio } from "../../../infrastructure/repositories/repositorioHito.js";

export async function actualizarHitoCasoUso(idRaw, payload) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const hito = await hitoRepositorio.obtenerPorId(id);
    if (!hito) throw crearError("El hito no existe", 404);

    const data = actualizarHito.parse(payload);

    try {
        return await hitoRepositorio.actualizar(id, {
            orden: data.orden,
            nombre: data.nombre !== undefined ? normalizarTexto(data.nombre) : undefined,
            descripcion: data.descripcion !== undefined ? normalizarTexto(data.descripcion) : undefined,
            peso: data.peso,
            fechaInicio: data.fechaInicio !== undefined
                ? (data.fechaInicio ? new Date(data.fechaInicio) : null)
                : undefined,
            fechaFin: data.fechaFin !== undefined
                ? (data.fechaFin ? new Date(data.fechaFin) : null)
                : undefined,
            estado: data.estado,
        });
    } catch (e) {
        if (e.code === "P2002") {
            throw crearError(`Ya existe un hito con el orden ${data.orden} en este proyecto`, 409);
        }
        throw e;
    }
}
