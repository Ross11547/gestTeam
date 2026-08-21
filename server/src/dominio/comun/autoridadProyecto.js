import { prisma } from "../../infrastructure/db/prisma.client.js";
import { esRolStaff } from "./helpersComunes.js";

// Autoridad sobre un proyecto: staff, director de carrera,
// docente de una clase vinculada o miembro OWNER.
export async function tieneAutoridadSobreProyecto(proyectoId, usuario) {
    if (!usuario?.id) return false;
    if (esRolStaff(usuario)) return true;
    if (usuario.esDirector) return true;

    const docenteDeClase = await prisma.proyectoMateria.findFirst({
        where: { proyectoId, clase: { docenteId: usuario.id } },
        select: { id: true },
    });
    if (docenteDeClase) return true;

    const esOwner = await prisma.miembroProyecto.findFirst({
        where: { proyectoId, usuarioId: usuario.id, rol: "OWNER" },
        select: { id: true },
    });
    return Boolean(esOwner);
}
