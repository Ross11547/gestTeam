import { ErrorValidacion, ErrorNoEncontrado, ErrorNoAutorizado } from "../../../dominio/pizarra/erroresPizarra.js";
import { esRolStaffPizarra } from "../../../dominio/pizarra/autorizacionPizarra.js";
import { pizarraRepositorio } from "../../../infrastructure/repositories/repositoriosPizarras.js";

export async function obtenerPizarraCasoUso(id, usuario) {
    const num = Number(id);
    if (!Number.isInteger(num) || num <= 0) throw new ErrorValidacion("id inválido");

    const data = await pizarraRepositorio.buscarPorId(num);
    if (!data) throw new ErrorNoEncontrado("Pizarra no encontrada");

    const uid = Number(usuario?.id);
    const puedeVer =
        data.esPublica ||
        esRolStaffPizarra(usuario) ||
        data.creadoPorId === uid ||
        data.colaboradores.some((c) => c.usuarioId === uid);
    if (!puedeVer) throw new ErrorNoAutorizado("No tienes acceso a esta pizarra");

    return data;
}
