import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function activarPeriodoAcademicoCasoUso(id) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("id inválido", 400);

    const actual = await prisma.periodoAcademico.findUnique({
        where: { id },
        select: { id: true, institucionId: true },
    });
    if (!actual) throw crearError("Periodo académico no encontrado", 404);

    return prisma.$transaction(async (tx) => {
        await tx.periodoAcademico.updateMany({
            where: { institucionId: actual.institucionId, activo: true, NOT: { id } },
            data: { activo: false },
        });

        return tx.periodoAcademico.update({
            where: { id },
            data: { activo: true },
        });
    });
}
