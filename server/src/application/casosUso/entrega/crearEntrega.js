import { crearEntrega } from "../../../dominio/entrega/validacionEntrega.js";
import { normalizarTexto, crearError } from "../../../dominio/entrega/helpersEntrega.js";
import { entregaRepositorio } from "../../../infrastructure/repositories/repositorioEntrega.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { puedeEntregarEnEquipo } from "../../../dominio/comun/autoridadRecursoAcademico.js";

export async function crearEntregaCasoUso(payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const data = crearEntrega.parse(payload);

    const hito = await prisma.hitoProyecto.findUnique({
        where: { id: data.hitoId },
        select: {
            id: true,
            proyectoId: true,
            proyectoPeriodoId: true,
        },
    });

    if (!hito) throw crearError("El hito indicado no existe", 404);

    const equipo = await prisma.equipo.findUnique({
        where: { id: data.equipoId },
        select: {
            id: true,
            proyectoId: true,
            proyectoPeriodoId: true,
            proyectoMateriaId: true,
        },
    });

    if (!equipo) throw crearError("El equipo indicado no existe", 404);

    if (hito.proyectoId !== equipo.proyectoId) {
        throw crearError("El equipo no pertenece al proyecto del hito", 400);
    }

    if (hito.proyectoPeriodoId && equipo.proyectoPeriodoId) {
        if (hito.proyectoPeriodoId !== equipo.proyectoPeriodoId) {
            throw crearError("El equipo no pertenece al mismo periodo operativo del hito", 400);
        }
    }

    const autorizado = await puedeEntregarEnEquipo(data.equipoId, usuario);
    if (!autorizado) {
        throw crearError("No tienes permisos para entregar en este equipo", 403);
    }

    return entregaRepositorio.crear({
        hitoId: data.hitoId,
        equipoId: data.equipoId,
        autorId: usuario.id,
        estado: data.estado ?? "ENTREGADO",
        comentario: data.comentario !== undefined ? normalizarTexto(data.comentario) : "",
        evidenciaUrl: data.evidenciaUrl ? data.evidenciaUrl : null,
    });
}
