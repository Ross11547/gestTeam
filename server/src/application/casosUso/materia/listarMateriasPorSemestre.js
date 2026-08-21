import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function listarMateriaPorSemestreCasoUso(semestreId) {
    if (!Number.isInteger(semestreId) || semestreId <= 0) throw crearError("semestreId requerido", 400);

    return prisma.materia.findMany({
        where: { semestreId },
        orderBy: { nombre: "asc" },
        select: { id: true, nombre: true, codigo: true, idCarrera: true, semestreId: true },
    });
}
