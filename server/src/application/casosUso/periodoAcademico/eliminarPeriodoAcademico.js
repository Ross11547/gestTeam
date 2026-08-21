import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function eliminarPeriodoAcademicoCasoUso(id) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("id inválido", 400);

    const actual = await prisma.periodoAcademico.findUnique({
        where: { id },
        select: { id: true, activo: true },
    });
    if (!actual) throw crearError("Periodo académico no encontrado", 404);

    if (actual.activo) {
        throw crearError("No se puede eliminar el periodo activo. Desactívalo primero.", 409);
    }

    return prisma.periodoAcademico.delete({ where: { id } });
}
