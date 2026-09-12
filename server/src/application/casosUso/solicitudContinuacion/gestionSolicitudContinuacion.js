import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError, ensureIdPositivo } from "../../../dominio/comun/helpersComunes.js";
import { puedeVerSolicitudContinuacion } from "../../../dominio/comun/autoridadProyectoPeriodo.js";

function nombreRol(usuario) {
    return String(usuario?.rol?.nombre || "").trim().toLowerCase();
}

function esAdmin(usuario) {
    return nombreRol(usuario) === "admin";
}

function esEstudiante(usuario) {
    return nombreRol(usuario) === "estudiante";
}

function esDirector(usuario) {
    return nombreRol(usuario) === "director";
}

function esDocente(usuario) {
    return nombreRol(usuario) === "docente";
}

export async function listarSolicitudContinuacionCasoUso(filtros = {}, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const where = {};
    if (filtros.proyectoId) where.proyectoId = Number(filtros.proyectoId);
    if (filtros.estado) where.estado = filtros.estado;

    if (esAdmin(usuario)) {
    } else if (esEstudiante(usuario)) {
        where.solicitanteId = usuario.id;
    } else if (esDirector(usuario) && usuario.idCarrera) {
        where.materia = { idCarrera: Number(usuario.idCarrera) };
    } else if (esDocente(usuario)) {
        where.clase = { docenteId: usuario.id };
    } else {
        return [];
    }

    const registros = await prisma.solicitudContinuacionProyecto.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            proyecto: { select: { id: true, titulo: true, estado: true } },
            periodo: { select: { id: true, nombre: true } },
            materia: { select: { id: true, nombre: true, codigo: true, idCarrera: true } },
            clase: { select: { id: true, paralelo: true, docenteId: true } },
            solicitante: { select: { id: true, nombre: true, apellido: true, correo: true } },
        },
    });

    return registros;
}

export async function obtenerSolicitudContinuacionCasoUso(idRaw, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const s = await prisma.solicitudContinuacionProyecto.findUnique({
        where: { id },
        include: {
            proyecto: { select: { id: true, titulo: true, estado: true } },
            periodo: { select: { id: true, nombre: true } },
            materia: { select: { id: true, nombre: true, codigo: true, idCarrera: true } },
            clase: { select: { id: true, paralelo: true, docenteId: true } },
            solicitante: { select: { id: true, nombre: true, apellido: true, correo: true } },
        },
    });

    if (!s) throw crearError("La solicitud no existe", 404);

    if (!puedeVerSolicitudContinuacion(s, usuario)) {
        throw crearError("No tienes permisos para ver esta solicitud", 403);
    }

    return s;
}
