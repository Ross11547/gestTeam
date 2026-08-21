import { actualizarPizarra } from "../../../dominio/pizarra/validacionesPizarra.js";
import { ErrorValidacion } from "../../../dominio/pizarra/erroresPizarra.js";
import { obtenerPizarraParaEscritura } from "../../../dominio/pizarra/autorizacionPizarra.js";
import { pizarraRepositorio } from "../../../infrastructure/repositories/repositoriosPizarras.js";

export async function actualizarPizarraCasoUso(id, payload, usuario) {
    const num = Number(id);
    if (!Number.isInteger(num) || num <= 0) throw new ErrorValidacion("id inválido");

    const parsed = actualizarPizarra.safeParse(payload);
    if (!parsed.success) throw new ErrorValidacion("Datos inválidos", parsed.error.flatten());

    await obtenerPizarraParaEscritura(num, usuario);

    const data = {};
    if (parsed.data.nombre !== undefined) data.nombre = parsed.data.nombre.trim();
    if (parsed.data.esPublica !== undefined) data.esPublica = Boolean(parsed.data.esPublica);

    const updated = await pizarraRepositorio.actualizar(num, data);
    return updated;
}
