import { ErrorValidacion } from "../../../dominio/pizarra/erroresPizarra.js";
import { obtenerPizarraParaEscritura } from "../../../dominio/pizarra/autorizacionPizarra.js";
import { pizarraRepositorio } from "../../../infrastructure/repositories/repositoriosPizarras.js";

export async function eliminarPizarraCasoUso(id, usuario) {
    const num = Number(id);
    if (!Number.isInteger(num) || num <= 0) throw new ErrorValidacion("id inválido");

    await obtenerPizarraParaEscritura(num, usuario, { soloDuenio: true });

    return pizarraRepositorio.eliminar(num);
}
