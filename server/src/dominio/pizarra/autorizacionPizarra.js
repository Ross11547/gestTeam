import { prisma } from "../../infrastructure/db/prisma.client.js";
import { ErrorNoEncontrado, ErrorNoAutorizado } from "./erroresPizarra.js";

export function esRolStaffPizarra(usuario) {
    const nombre = String(usuario?.rol?.nombre || "").trim().toLowerCase();
    return nombre === "admin" || nombre === "director";
}

// Carga la pizarra verificando que el usuario pueda escribir en ella:
// creador, colaborador, o staff académico. Con soloDuenio, solo creador o staff.
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
    if (!soloDuenio && pizarra.colaboradores.some((c) => c.usuarioId === usuario.id)) return pizarra;

    throw new ErrorNoAutorizado("No tienes permisos sobre esta pizarra");
}
