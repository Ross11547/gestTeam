import { prisma } from "../../infrastructure/db/prisma.client.js";
import { ErrorNoEncontrado, ErrorNoAutorizado } from "./erroresPizarra.js";

export function esRolStaffPizarra(usuario) {
    const nombre = String(usuario?.rol?.nombre || "").trim().toLowerCase();
    return nombre === "admin" || nombre === "director";
}

function colaboradorPuedeEscribir(colaboradores, usuarioId) {
    const colaborador = colaboradores.find((c) => c.usuarioId === usuarioId);
    if (!colaborador) return false;
    const rol = String(colaborador.rol || "").trim().toUpperCase();
    return rol === "OWNER" || rol === "EDITOR";
}

export async function obtenerPizarraParaEscritura(pizarraId, usuario, { soloDuenio = false } = {}) {
    const pizarra = await prisma.pizarra.findUnique({
        where: { id: pizarraId },
        select: {
            id: true,
            creadoPorId: true,
            colaboradores: { select: { usuarioId: true, rol: true } },
        },
    });
    if (!pizarra) throw new ErrorNoEncontrado("Pizarra no encontrada");

    if (esRolStaffPizarra(usuario)) return pizarra;
    if (pizarra.creadoPorId === usuario.id) return pizarra;
    if (!soloDuenio && colaboradorPuedeEscribir(pizarra.colaboradores, usuario.id)) return pizarra;

    throw new ErrorNoAutorizado("No tienes permisos para modificar esta pizarra");
}
