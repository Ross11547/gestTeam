import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { Prisma } from "@prisma/client";
import { crearMateria } from "../../../dominio/materia/validacionMateria.js";
import { makeCodigoMateria } from "../../../dominio/materia/helpersMateria.js";
import { generarCodigoUnicoCasoUso } from "./codigoUnicoMateria.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { materiaRepositorio } from "../../../infrastructure/repositories/repositorioMateria.js";

export async function crearMateriaCasoUso(payload) {
    const data = crearMateria.parse(payload);

    const carrera = await prisma.carrera.findUnique({ where: { id: data.idCarrera }, select: { id: true } });
    if (!carrera) throw crearError("La carrera indicada no existe", 404);

    if (data.semestreId) {
        const semestre = await prisma.semestre.findUnique({
            where: { id: data.semestreId },
            select: { id: true, carreraId: true },
        });
        if (!semestre) throw crearError("El semestre indicado no existe", 404);
        if (semestre.carreraId !== data.idCarrera) {
            throw crearError("El semestre no pertenece a la carrera seleccionada", 400);
        }
    }

    const base = makeCodigoMateria(data.nombre) || "MAT";
    const codigo = await generarCodigoUnicoCasoUso(base);

    try {
        return await materiaRepositorio.crear({
            nombre: data.nombre,
            codigo,
            idCarrera: data.idCarrera,
            semestreId: data.semestreId ?? null,
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            throw crearError("El código de la materia ya existe", 409);
        }
        throw e;
    }
}
