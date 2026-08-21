import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function eliminarSemestreCasoUso(id) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("id inválido", 400);

    const existe = await prisma.semestre.findUnique({ where: { id }, select: { id: true } });
    if (!existe) throw crearError("Semestre no encontrado", 404);

    const [materias, usuarios] = await Promise.all([
        prisma.materia.count({ where: { semestreId: id } }),
        prisma.usuario.count({ where: { semestreId: id } }),
    ]);

    if (materias > 0 || usuarios > 0) {
        throw crearError("No se puede eliminar: el semestre tiene registros asociados (materias/usuarios)", 409);
    }

    return prisma.semestre.delete({ where: { id } });
}
