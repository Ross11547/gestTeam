import { crearEntrega } from "../../../dominio/entrega/validacionEntrega.js";
import { normalizarTexto, crearError } from "../../../dominio/entrega/helpersEntrega.js";
import { entregaRepositorio } from "../../../infrastructure/repositories/repositorioEntrega.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { esStaff } from "../equipo/permisosEquipo.js";

export async function crearEntregaCasoUso(payload, usuario) {
    const data = crearEntrega.parse(payload);

    const hito = await prisma.hitoProyecto.findUnique({
        where: { id: data.hitoId },
        select: { id: true, proyectoId: true },
    });

    if (!hito) throw crearError("El hito indicado no existe", 404);

    const equipo = await prisma.equipo.findUnique({
        where: { id: data.equipoId },
        select: { id: true, proyectoId: true },
    });

    if (!equipo) throw crearError("El equipo indicado no existe", 404);

    // El hito y el equipo deben pertenecer al mismo proyecto.
    if (hito.proyectoId !== equipo.proyectoId) {
        throw crearError("El equipo no pertenece al proyecto del hito", 400);
    }

    // Solo miembros activos del equipo (o staff) pueden entregar.
    if (!esStaff(usuario)) {
        const miembro = await prisma.equipoMiembro.findUnique({
            where: {
                equipoId_usuarioId: { equipoId: data.equipoId, usuarioId: usuario.id },
            },
        });

        if (!miembro || !miembro.activo) {
            throw crearError("No eres miembro de este equipo", 403);
        }
    }

    return entregaRepositorio.crear({
        hitoId: data.hitoId,
        equipoId: data.equipoId,
        autorId: usuario.id,
        estado: data.estado ?? undefined,
        comentario: data.comentario !== undefined ? normalizarTexto(data.comentario) : "",
        evidenciaUrl: data.evidenciaUrl ? data.evidenciaUrl : null,
    });
}
