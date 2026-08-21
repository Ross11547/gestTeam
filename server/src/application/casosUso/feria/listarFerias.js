import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function listarFeriasCasoUso() {
    return prisma.feria.findMany({
        select: {
            id: true,
            institucionId: true,
            nombre: true,
            descripcion: true,
            fecha: true,
            lugar: true,
            imagenMapaUrl: true,
            createdAt: true,
            _count: { select: { categorias: true, equipos: true } },
        },
        orderBy: { fecha: "desc" },
    });
}

export async function obtenerFeriaPorIdCasoUso(id) {
    return prisma.feria.findUnique({
        where: { id },
        select: {
            id: true,
            institucionId: true,
            nombre: true,
            descripcion: true,
            fecha: true,
            lugar: true,
            imagenMapaUrl: true,
            createdAt: true,
            categorias: {
                select: { id: true, nombre: true, descripcion: true },
                orderBy: { nombre: "asc" },
            },
            equipos: {
                select: {
                    id: true,
                    nombreEquipo: true,
                    nombreProyecto: true,
                    descripcion: true,
                    mesaCodigo: true,
                    mesaX: true,
                    mesaY: true,
                    categoriaId: true,
                    _count: { select: { miembros: true, evaluaciones: true } },
                },
                orderBy: [{ categoriaId: "asc" }, { nombreEquipo: "asc" }],
            },
        },
    });
}
