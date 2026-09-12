import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError, ensureIdPositivo } from "../../../dominio/comun/helpersComunes.js";
import { puedeResolverSolicitudContinuacion } from "../../../dominio/comun/autoridadProyectoPeriodo.js";

const incluirSolicitud = {
    proyecto: { select: { id: true, titulo: true, estado: true, tipoGrupo: true } },
    periodo: { select: { id: true, nombre: true } },
    materia: { select: { id: true, nombre: true, codigo: true, idCarrera: true } },
    clase: { select: { id: true, paralelo: true, periodoId: true, materiaId: true, docenteId: true } },
    solicitante: { select: { id: true, nombre: true, apellido: true, correo: true } },
};

export async function resolverSolicitudContinuacionCasoUso(idRaw, payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const estado = String(payload?.estado || "").trim().toUpperCase();
    if (!["APROBADA", "RECHAZADA"].includes(estado)) {
        throw crearError("estado debe ser APROBADA o RECHAZADA", 400);
    }

    const solicitud = await prisma.solicitudContinuacionProyecto.findUnique({
        where: { id },
        include: incluirSolicitud,
    });
    if (!solicitud) throw crearError("La solicitud no existe", 404);
    if (solicitud.estado !== "PENDIENTE") throw crearError("La solicitud ya fue resuelta", 409);
    if (!puedeResolverSolicitudContinuacion(solicitud, usuario)) {
        throw crearError("No tienes permisos para resolver esta solicitud", 403);
    }

    const respuesta = payload?.respuesta == null ? null : String(payload.respuesta).trim();
    if (estado === "RECHAZADA") {
        return prisma.solicitudContinuacionProyecto.update({
            where: { id },
            data: { estado, respuesta, aprobadorId: usuario.id },
            include: incluirSolicitud,
        });
    }

    if (solicitud.proyecto.estado === "CERRADO") {
        throw crearError("Un proyecto CERRADO no puede retomarse directamente", 403);
    }
    if (solicitud.proyecto.estado !== "INCONCLUSO") {
        throw crearError("Solo puede retomarse un proyecto INCONCLUSO", 409);
    }
    if (!solicitud.clase) {
        throw crearError("La aprobación requiere una ClaseMateria destino", 400);
    }
    if (solicitud.clase.periodoId !== solicitud.periodoId || solicitud.clase.materiaId !== solicitud.materiaId) {
        throw crearError("La clase no corresponde al contexto académico solicitado", 400);
    }

    const hitosPeriodo = await prisma.hitoPeriodo.findMany({
        where: { periodoId: solicitud.periodoId },
        orderBy: { orden: "asc" },
    });
    if (hitosPeriodo.length !== 5 || hitosPeriodo.some((hito, indice) => hito.orden !== indice + 1)) {
        throw crearError("El periodo destino no tiene los hitos H1-H5 completos", 400);
    }

    return prisma.$transaction(async (tx) => {
        const marcada = await tx.solicitudContinuacionProyecto.updateMany({
            where: { id, estado: "PENDIENTE" },
            data: { estado: "APROBADA", respuesta, aprobadorId: usuario.id },
        });
        if (marcada.count !== 1) throw crearError("La solicitud ya fue resuelta", 409);

        let proyectoPeriodo = await tx.proyectoPeriodo.findUnique({
            where: { proyectoId_periodoId: { proyectoId: solicitud.proyectoId, periodoId: solicitud.periodoId } },
        });

        if (!proyectoPeriodo) {
            proyectoPeriodo = await tx.proyectoPeriodo.create({
                data: { proyectoId: solicitud.proyectoId, periodoId: solicitud.periodoId, estado: "ACTIVO" },
            });
            await tx.hitoProyecto.createMany({
                data: hitosPeriodo.map((hito) => ({
                    proyectoId: solicitud.proyectoId,
                    proyectoPeriodoId: proyectoPeriodo.id,
                    hitoPeriodoId: hito.id,
                    orden: hito.orden,
                    nombre: hito.nombre,
                })),
            });
        } else if (proyectoPeriodo.estado !== "ACTIVO") {
            proyectoPeriodo = await tx.proyectoPeriodo.update({
                where: { id: proyectoPeriodo.id },
                data: { estado: "ACTIVO" },
            });
        }

        let proyectoMateria = await tx.proyectoMateria.findUnique({
            where: {
                proyectoPeriodoId_materiaId: {
                    proyectoPeriodoId: proyectoPeriodo.id,
                    materiaId: solicitud.materiaId,
                },
            },
        });

        if (!proyectoMateria) {
            proyectoMateria = await tx.proyectoMateria.create({
                data: {
                    proyectoId: solicitud.proyectoId,
                    proyectoPeriodoId: proyectoPeriodo.id,
                    periodoId: solicitud.periodoId,
                    materiaId: solicitud.materiaId,
                    claseId: solicitud.claseId,
                },
            });
        } else if (proyectoMateria.claseId && proyectoMateria.claseId !== solicitud.claseId) {
            throw crearError("La materia ya está vinculada a otra clase en este periodo", 409);
        } else if (!proyectoMateria.claseId) {
            proyectoMateria = await tx.proyectoMateria.update({
                where: { id: proyectoMateria.id },
                data: { claseId: solicitud.claseId },
            });
        }

        let equipo = await tx.equipo.findFirst({
            where: {
                proyectoMateriaId: proyectoMateria.id,
                miembros: { some: { usuarioId: solicitud.solicitanteId, activo: true } },
            },
        });

        if (!equipo) {
            equipo = await tx.equipo.create({
                data: {
                    proyectoId: solicitud.proyectoId,
                    proyectoPeriodoId: proyectoPeriodo.id,
                    proyectoMateriaId: proyectoMateria.id,
                    nombre: `${solicitud.proyecto.titulo} - ${solicitud.periodo.nombre}`,
                    tipoGrupo: solicitud.proyecto.tipoGrupo,
                    periodoId: solicitud.periodoId,
                    materiaId: solicitud.materiaId,
                    claseId: solicitud.claseId,
                    creadoPorId: solicitud.solicitanteId,
                },
            });
            await tx.equipoMiembro.create({
                data: {
                    equipoId: equipo.id,
                    usuarioId: solicitud.solicitanteId,
                    rolEquipo: "LIDER",
                    activo: true,
                },
            });
        }

        await tx.proyecto.update({
            where: { id: solicitud.proyectoId },
            data: { estado: "ACTIVO" },
        });

        const solicitudResuelta = await tx.solicitudContinuacionProyecto.findUnique({
            where: { id },
            include: incluirSolicitud,
        });

        return {
            ...solicitudResuelta,
            contexto: { proyectoPeriodo, proyectoMateria, equipo },
        };
    });
}
