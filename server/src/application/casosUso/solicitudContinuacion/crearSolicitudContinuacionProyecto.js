import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError } from "../../../dominio/comun/helpersComunes.js";

function nombreRol(usuario) {
    return String(usuario?.rol?.nombre || "").trim().toLowerCase();
}

function esEstudiante(usuario) {
    return nombreRol(usuario) === "estudiante";
}

export async function crearSolicitudContinuacionProyectoCasoUso(payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);
    if (!esEstudiante(usuario)) throw crearError("Solo los estudiantes pueden solicitar continuación", 403);

    const data = payload || {};

    if (!data.proyectoId || !Number.isInteger(Number(data.proyectoId)) || Number(data.proyectoId) <= 0) {
        throw crearError("proyectoId inválido", 400);
    }
    if (!data.periodoId || !Number.isInteger(Number(data.periodoId)) || Number(data.periodoId) <= 0) {
        throw crearError("periodoId inválido", 400);
    }
    if (!data.materiaId || !Number.isInteger(Number(data.materiaId)) || Number(data.materiaId) <= 0) {
        throw crearError("materiaId inválido", 400);
    }

    const proyecto = await prisma.proyecto.findUnique({ where: { id: Number(data.proyectoId) }, select: { id: true, estado: true, titulo: true } });
    if (!proyecto) throw crearError("El proyecto no existe", 404);
    if (proyecto.estado !== "INCONCLUSO") {
        throw crearError("Solo se puede solicitar continuación de un proyecto INCONCLUSO", 403);
    }

    const periodo = await prisma.periodoAcademico.findUnique({ where: { id: Number(data.periodoId) }, select: { id: true } });
    if (!periodo) throw crearError("El periodo destino no existe", 404);

    const materia = await prisma.materia.findUnique({ where: { id: Number(data.materiaId) }, select: { id: true } });
    if (!materia) throw crearError("La materia destino no existe", 404);

    let claseId = null;
    if (data.claseId) {
        claseId = Number(data.claseId);
        const clase = await prisma.claseMateria.findUnique({
            where: { id: claseId },
            select: { id: true, materiaId: true, periodoId: true },
        });
        if (!clase) throw crearError("La clase destino no existe", 404);
        if (clase.materiaId !== Number(data.materiaId)) {
            throw crearError("La clase no corresponde a la materia destino", 400);
        }
        if (clase.periodoId !== Number(data.periodoId)) {
            throw crearError("La clase no corresponde al periodo destino", 400);
        }
    }

    // Validar relación académica del solicitante con el contexto destino cuando el modelo lo permite.
    const inscripcionWhere = {
        usuarioId: usuario.id,
        periodoId: Number(data.periodoId),
        materiaId: Number(data.materiaId),
    };
    if (claseId) inscripcionWhere.claseId = claseId;

    const inscripcion = await prisma.inscripcionMateria.findFirst({ where: inscripcionWhere, select: { id: true } });
    if (!inscripcion) {
        throw crearError("El solicitante no está inscrito en el contexto académico destino", 403);
    }

    return prisma.solicitudContinuacionProyecto.create({
        data: {
            proyectoId: Number(data.proyectoId),
            solicitanteId: usuario.id,
            periodoId: Number(data.periodoId),
            materiaId: Number(data.materiaId),
            claseId: claseId,
            estado: "PENDIENTE",
            motivo: data.motivo ?? null,
        },
        include: {
            proyecto: { select: { id: true, titulo: true, estado: true } },
            periodo: { select: { id: true, nombre: true } },
            materia: { select: { id: true, nombre: true, codigo: true } },
            clase: { select: { id: true, paralelo: true } },
            solicitante: { select: { id: true, nombre: true, apellido: true, correo: true } },
        },
    });
}
