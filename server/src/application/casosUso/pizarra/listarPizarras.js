import { listarPizarras } from "../../../dominio/pizarra/validacionesPizarra.js";
import { ErrorValidacion } from "../../../dominio/pizarra/erroresPizarra.js";
import { esRolStaffPizarra } from "../../../dominio/pizarra/autorizacionPizarra.js";
import { pizarraRepositorio } from "../../../infrastructure/repositories/repositoriosPizarras.js";

export async function listarPizarrasCasoUso(query, usuario) {
    const parsed = listarPizarras.safeParse(query);
    if (!parsed.success) throw new ErrorValidacion("Parámetros inválidos", parsed.error.flatten());

    const { proyectoId, equipoId, periodoId } = parsed.data;

    const filtros = {
        ...(proyectoId ? { proyectoId } : {}),
        ...(equipoId ? { equipoId } : {}),
        ...(periodoId ? { periodoId } : {}),
    };

    if (!esRolStaffPizarra(usuario)) {
        const uid = Number(usuario?.id);
        filtros.OR = [
            { esPublica: true },
            { creadoPorId: uid },
            { colaboradores: { some: { usuarioId: uid } } },
        ];
    }

    return pizarraRepositorio.listar(filtros);
}
