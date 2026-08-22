import { prisma } from "../../../infrastructure/db/prisma.client.js";


export function esStaff(usuario) {
    const rol = String(usuario?.rol?.nombre || "").trim().toLowerCase();
    return ["admin", "director", "docente"].includes(rol);
}

export function esAdminODirector(usuario) {
    const rol = String(usuario?.rol?.nombre || "").trim().toLowerCase();
    return ["admin", "director"].includes(rol);
}

export async function puedeGestionarEquipo(usuario, equipo) {
    if (esStaff(usuario)) return true;
    if (equipo.creadoPorId === usuario.id) return true;

    const miembro = await prisma.equipoMiembro.findUnique({
        where: {
            equipoId_usuarioId: { equipoId: equipo.id, usuarioId: usuario.id },
        },
    });

    return Boolean(miembro && miembro.activo && miembro.rolEquipo === "LIDER");
}
