import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { Prisma } from "@prisma/client";
import { actualizarCarrera, derivarSiglaDesdeNombre } from "../../../dominio/carrera/validacionCarrera.js";
import { carreraRepositorio } from "../../../infrastructure/repositories/repositorioCarrera.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function actualizarCarreraCasoUso(id, payload) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("id inválido", 400);
    const data = actualizarCarrera.parse(payload);

    const actual = await prisma.carrera.findUnique({
        where: { id },
        select: { id: true, nombre: true, idFacultad: true, sigla: true },
    });
    if (!actual) throw crearError("Carrera no encontrada", 404);

    if (data.idFacultad !== undefined) {
        const fac = await prisma.facultad.findUnique({
            where: { id: data.idFacultad },
            select: { id: true },
        });
        if (!fac) throw crearError("La facultad indicada no existe", 404);
    }

    const idFacultadFinal = data.idFacultad ?? actual.idFacultad;
    const nombreFinal = data.nombre ?? actual.nombre;

    if (data.nombre !== undefined || data.idFacultad !== undefined) {
        const dup = await carreraRepositorio.existePorNombreEnFacultad(idFacultadFinal, nombreFinal, id);
        if (dup) throw crearError("Ya existe una carrera con ese nombre en la facultad", 409);
    }

    let siglaUpdate = {};
    if (data.sigla !== undefined) {
        siglaUpdate = { sigla: data.sigla };
    } else if (data.nombre !== undefined && !actual.sigla) {
        siglaUpdate = { sigla: derivarSiglaDesdeNombre(nombreFinal) };
    }

    try {
        return await carreraRepositorio.actualizar(id, {
            ...(data.nombre !== undefined ? { nombre: data.nombre } : {}),
            ...(data.idFacultad !== undefined ? { idFacultad: data.idFacultad } : {}),
            ...siglaUpdate,
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            throw crearError("La sigla ya está en uso", 409);
        }
        throw e;
    }
}
