import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { ensureIdPositivo, crearError, esRolStaff } from "../../../dominio/reporte/helpersReporte.js";
import { listarReportes } from "../../../dominio/reporte/validacionReporte.js";

export async function listarReportesCasoUso(query) {
    const filtros = listarReportes.parse(query ?? {});

    // Paginación simple: limit (1..200, por defecto 50) y offset.
    const limit = Math.min(Math.max(Number(filtros.limit) || 50, 1), 200);
    const offset = Math.max(Number(filtros.offset) || 0, 0);

    return prisma.reporteGenerado.findMany({
        where: {
            tipo: filtros.tipo,
            periodoId: filtros.periodoId,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
            id: true,
            tipo: true,
            periodoId: true,
            periodo: { select: { id: true, nombre: true } },
            generadoPorId: true,
            generadoPor: { select: { id: true, nombre: true, apellido: true } },
            archivoUrl: true,
            createdAt: true,
        },
    });
}

export async function obtenerReporteCasoUso(idRaw) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const reporte = await prisma.reporteGenerado.findUnique({
        where: { id },
        include: {
            generadoPor: { select: { id: true, nombre: true, apellido: true } },
            periodo: { select: { id: true, nombre: true } },
        },
    });
    if (!reporte) throw crearError("El reporte indicado no existe", 404);

    return reporte;
}

export async function eliminarReporteCasoUso(idRaw, solicitante) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const reporte = await prisma.reporteGenerado.findUnique({ where: { id }, select: { id: true, generadoPorId: true } });
    if (!reporte) throw crearError("El reporte indicado no existe", 404);

    // Admin/Director borran cualquiera; el docente solo los suyos.
    const esPropio = reporte.generadoPorId === solicitante.id;
    if (!esPropio && !esRolStaff(solicitante)) throw crearError("No puedes eliminar este reporte", 403);

    await prisma.reporteGenerado.delete({ where: { id } });
    return { id };
}
