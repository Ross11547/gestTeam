import { crearEvaluacion } from "../../../dominio/evaluacionProyecto/validacionEvaluacionProyecto.js";
import { crearError, esRolStaff } from "../../../dominio/evaluacionProyecto/helpersEvaluacionProyecto.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

// El tipo de evaluador se deduce del rol: Admin->ADMIN, Director->DIRECTOR,
// Docente->DOCENTE. JURADO es el único valor que se acepta explícito.
function derivarTipoEvaluador(usuario, tipoExplicito) {
    if (tipoExplicito === "JURADO") return "JURADO";
    const nombre = String(usuario?.rol?.nombre || "").trim().toLowerCase();
    if (nombre === "admin") return "ADMIN";
    if (nombre === "director") return "DIRECTOR";
    if (nombre === "docente") return "DOCENTE";
    return null;
}

export async function crearEvaluacionCasoUso(payload, usuario) {
    const data = crearEvaluacion.parse(payload);

    const nombreRol = String(usuario?.rol?.nombre || "").trim().toLowerCase();
    if (nombreRol === "estudiante") {
        throw crearError("Los estudiantes no pueden evaluar proyectos", 403);
    }

    const proyecto = await prisma.proyecto.findUnique({
        where: { id: data.proyectoId },
        select: { id: true },
    });
    if (!proyecto) throw crearError("El proyecto indicado no existe", 404);

    // Nadie evalúa un proyecto del que forma parte.
    const esMiembro = await prisma.miembroProyecto.findUnique({
        where: { proyectoId_usuarioId: { proyectoId: data.proyectoId, usuarioId: usuario.id } },
        select: { id: true },
    });
    if (esMiembro) throw crearError("No puedes evaluar un proyecto al que perteneces", 409);

    if (data.periodoId) {
        const periodo = await prisma.periodoAcademico.findUnique({
            where: { id: data.periodoId },
            select: { id: true },
        });
        if (!periodo) throw crearError("El periodo académico indicado no existe", 404);
    }

    // Docentes solo evalúan proyectos de sus clases; staff evalúa cualquiera.
    if (!esRolStaff(usuario)) {
        const asignado = await prisma.proyectoMateria.findFirst({
            where: { proyectoId: data.proyectoId, clase: { docenteId: usuario.id } },
            select: { id: true },
        });
        if (!asignado) throw crearError("Solo puedes evaluar proyectos de tus clases", 403);
    }

    try {
        return await prisma.evaluacionProyecto.create({
            data: {
                proyectoId: data.proyectoId,
                periodoId: data.periodoId ?? null,
                evaluadorId: usuario.id,
                tipoEvaluador: derivarTipoEvaluador(usuario, data.tipoEvaluador) ?? "DOCENTE",
                puntaje: data.puntaje,
                comentario: data.comentario ?? "",
                criteriosJson: data.criteriosJson === undefined ? undefined : data.criteriosJson ?? null,
            },
            select: { id: true, proyectoId: true, evaluadorId: true, tipoEvaluador: true, puntaje: true, createdAt: true },
        });
    } catch (e) {
        if (e.code === "P2002") {
            throw crearError("Ya registraste una evaluación para este proyecto", 409);
        }
        throw e;
    }
}
