import { entregaRepositorio } from "../../../infrastructure/repositories/repositorioEntrega.js";
import { ensureIdPositivo, crearError } from "../../../dominio/entrega/helpersEntrega.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { obtenerEquiposPermitidos } from "../../../dominio/comun/autoridadProyectoPeriodo.js";

export async function listarEntregasPorHitoCasoUso(query = {}, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const hitoId = ensureIdPositivo(query.hitoId);
    if (!hitoId) throw crearError("El parámetro hitoId es obligatorio");

    const hito = await prisma.hitoProyecto.findUnique({
        where: { id: hitoId },
        select: { proyectoPeriodoId: true },
    });
    if (!hito) throw crearError("El hito no existe", 404);

    const equiposPermitidos = await obtenerEquiposPermitidos(hito.proyectoPeriodoId, usuario);
    if (equiposPermitidos.length === 0) {
        throw crearError("No tienes permisos para ver entregas de este hito", 403);
    }

    return entregaRepositorio.listarPorHitoYEquipos(hitoId, equiposPermitidos);
}
