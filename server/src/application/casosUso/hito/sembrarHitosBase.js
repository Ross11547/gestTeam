import { ensureIdPositivo, crearError } from "../../../dominio/hito/helpersHito.js";
import { tieneAutoridadSobreProyecto } from "../../../dominio/comun/autoridadProyecto.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

const HITOS_BASE = [
    {
        orden: 1,
        nombre: "Nivelación y bienvenida",
        descripcion: "Diagnóstico inicial, acuerdos del equipo y nivelación de conocimientos.",
        peso: 10,
    },
    {
        orden: 2,
        nombre: "Propuesta y anteproyecto",
        descripcion: "Planteamiento del problema, objetivos y alcance aprobados por el docente.",
        peso: 20,
    },
    {
        orden: 3,
        nombre: "Avance intermedio",
        descripcion: "Primer producto funcional parcial con evidencias de avance.",
        peso: 25,
    },
    {
        orden: 4,
        nombre: "Producto casi terminado",
        descripcion: "Integración completa del sistema pendiente de ajustes y pruebas.",
        peso: 20,
    },
    {
        orden: 5,
        nombre: "Entrega final y defensa",
        descripcion: "Entrega definitiva, documentación final y defensa ante el evaluador.",
        peso: 25,
    },
];

export async function sembrarHitosBaseInterno(proyectoId) {
    const existentes = await prisma.hitoProyecto.count({ where: { proyectoId } });
    if (existentes > 0) return false;

    await prisma.hitoProyecto.createMany({
        data: HITOS_BASE.map((h) => ({ ...h, proyectoId })),
    });
    return true;
}

export async function sembrarHitosBaseCasoUso(proyectoIdRaw, usuario) {
    const proyectoId = ensureIdPositivo(proyectoIdRaw);
    if (!proyectoId) throw crearError("ID inválido", 400);

    const proyecto = await prisma.proyecto.findUnique({
        where: { id: proyectoId },
        select: { id: true, titulo: true },
    });
    if (!proyecto) throw crearError("El proyecto indicado no existe", 404);

    if (!(await tieneAutoridadSobreProyecto(proyectoId, usuario))) {
        throw crearError("No tienes autoridad para sembrar hitos en este proyecto", 403);
    }

    const sembrados = await sembrarHitosBaseInterno(proyectoId);
    if (!sembrados) {
        throw crearError("El proyecto ya tiene hitos definidos", 409);
    }

    const hitos = await prisma.hitoProyecto.findMany({
        where: { proyectoId },
        orderBy: { orden: "asc" },
        select: { id: true, orden: true, nombre: true, peso: true, estado: true },
    });
    return { proyectoId, hitos };
}
