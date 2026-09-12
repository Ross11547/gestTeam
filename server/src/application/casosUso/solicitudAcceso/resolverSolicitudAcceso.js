import { resolverSolicitudAcceso } from "../../../dominio/solicitudAcceso/validacionSolicitudAcceso.js";
import { ensureIdPositivo, crearError } from "../../../dominio/solicitudAcceso/helpersSolicitudAcceso.js";
import { validarAutoridadSolicitudAcceso } from "../../../dominio/solicitudAcceso/autorizacionSolicitudAcceso.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function resolverSolicitudAccesoCasoUso(id, payload, usuario) {
    const idValido = ensureIdPositivo(id);
    if (!idValido) throw crearError("ID inválido", 400);

    const data = resolverSolicitudAcceso.parse(payload);

    const solicitud = await prisma.solicitudAccesoProyecto.findUnique({
        where: { id: idValido },
        select: {
            id: true,
            proyectoId: true,
            proyectoMateriaId: true,
            solicitanteId: true,
            estado: true,
            proyecto: { select: { estado: true, tipoGrupo: true } },
            proyectoMateria: { select: { claseId: true, materia: { select: { idCarrera: true } } } },
            documentos: { select: { documentoId: true } },
        },
    });
    if (!solicitud) throw crearError("La solicitud indicada no existe", 404);
    if (solicitud.estado !== "PENDIENTE") {
        throw crearError("La solicitud ya fue resuelta", 409);
    }

    if (!solicitud.documentos.length) throw crearError("La solicitud no contiene documentos autorizables", 409);
    await validarAutoridadSolicitudAcceso(solicitud, usuario);
    if (data.estado === "APROBADA" && data.expiresAt && data.expiresAt <= new Date()) {
        throw crearError("La fecha de expiración debe ser futura", 400);
    }

    const resultado = await prisma.solicitudAccesoProyecto.updateMany({
        where: { id: idValido, estado: "PENDIENTE" },
        data: {
            estado: data.estado,
            respuesta: data.respuesta ?? "",
            aprobadorId: usuario.id,
            expiresAt: data.estado === "APROBADA" ? (data.expiresAt ?? null) : null,
            resueltoEn: new Date(),
        },
    });
    if (resultado.count !== 1) throw crearError("La solicitud ya fue resuelta", 409);

    return prisma.solicitudAccesoProyecto.findUnique({
        where: { id: idValido },
        select: {
            id: true,
            proyectoId: true,
            proyectoMateriaId: true,
            estado: true,
            tipo: true,
            respuesta: true,
            expiresAt: true,
            resueltoEn: true,
            solicitante: { select: { id: true, nombre: true, apellido: true } },
            aprobador: { select: { id: true, nombre: true, apellido: true } },
            documentos: { select: { documentoId: true } },
        },
    });
}
