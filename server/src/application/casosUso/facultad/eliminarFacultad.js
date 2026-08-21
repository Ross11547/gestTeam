import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function eliminarFacultadCasoUso(id) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("id inválido", 400);

    const existe = await prisma.facultad.findUnique({
        where: { id },
        select: { id: true },
    });
    if (!existe) throw crearError("Facultad no encontrada", 404);

    const carreras = await prisma.carrera.count({ where: { idFacultad: id } });
    if (carreras > 0) {
        throw crearError("No se puede eliminar: la facultad tiene carreras asociadas", 409);
    }

    return prisma.facultad.delete({ where: { id } });
}
