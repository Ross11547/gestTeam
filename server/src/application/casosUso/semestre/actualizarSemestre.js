import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { Prisma } from "@prisma/client";
import { actualizarSemestre, etiquetaSemestre } from "../../../dominio/semestre/validacionSemestre.js";
import { semestreRepositorio } from "../../../infrastructure/repositories/repositorioSemestre.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function actualizarSemestreCasoUso(id, payload) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("id inválido", 400);

    const data = actualizarSemestre.parse(payload);

    const actual = await prisma.semestre.findUnique({
        where: { id },
        select: { id: true, numero: true, carreraId: true, etiqueta: true },
    });
    if (!actual) throw crearError("Semestre no encontrado", 404);

    if (data.carreraId !== undefined) {
        const carrera = await prisma.carrera.findUnique({ where: { id: data.carreraId }, select: { id: true } });
        if (!carrera) throw crearError("La carrera indicada no existe", 404);
    }

    const carreraIdFinal = data.carreraId ?? actual.carreraId;
    const numeroFinal = data.numero ?? actual.numero;

    if (data.carreraId !== undefined || data.numero !== undefined) {
        const dup = await semestreRepositorio.existePorCarreraNumero(carreraIdFinal, numeroFinal, id);
        if (dup) throw crearError("Ya existe ese semestre para la carrera", 409);
    }

    let etiquetaUpdate = {};
    if (data.etiqueta !== undefined) {
        etiquetaUpdate = { etiqueta: data.etiqueta };
    } else if (data.numero !== undefined) {
        etiquetaUpdate = { etiqueta: etiquetaSemestre(numeroFinal) };
    }

    try {
        return await semestreRepositorio.actualizar(id, {
            ...(data.numero !== undefined ? { numero: data.numero } : {}),
            ...(data.carreraId !== undefined ? { carreraId: data.carreraId } : {}),
            ...etiquetaUpdate,
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            throw crearError("Ya existe ese semestre para la carrera", 409);
        }
        throw e;
    }
}
