import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { horarioRepositorio } from "../../../infrastructure/repositories/repositorioHorario.js";

export async function eliminarHorarioCasoUso(id) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("ID inválido", 400);

    const exists = await prisma.horario.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw crearError("Horario no encontrado", 404);

    return horarioRepositorio.eliminar(id);
}
