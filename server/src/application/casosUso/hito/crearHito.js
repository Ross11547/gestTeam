import { crearHito } from "../../../dominio/hito/validacionHito.js";
import { normalizarTexto, crearError } from "../../../dominio/hito/helpersHito.js";
import { hitoRepositorio } from "../../../infrastructure/repositories/repositorioHito.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function crearHitoCasoUso(payload) {
    const data = crearHito.parse(payload);

    const proyecto = await prisma.proyecto.findUnique({
        where: { id: data.proyectoId },
        select: { id: true },
    });

    if (!proyecto) throw crearError("El proyecto indicado no existe", 404);

    const duplicado = await prisma.hitoProyecto.findUnique({
        where: { proyectoId_orden: { proyectoId: data.proyectoId, orden: data.orden } },
        select: { id: true },
    });

    if (duplicado) {
        throw crearError(
            `Ya existe un hito con el orden ${data.orden} en este proyecto`,
            409
        );
    }

    try {
        return await hitoRepositorio.crear({
            proyectoId: data.proyectoId,
            orden: data.orden,
            nombre: normalizarTexto(data.nombre),
            descripcion: data.descripcion !== undefined ? normalizarTexto(data.descripcion) : "",
            peso: data.peso ?? null,
            fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : null,
            fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
            estado: data.estado,
        });
    } catch (e) {
        if (e.code === "P2002") {
            throw crearError(`Ya existe un hito con el orden ${data.orden} en este proyecto`, 409);
        }
        throw e;
    }
}
