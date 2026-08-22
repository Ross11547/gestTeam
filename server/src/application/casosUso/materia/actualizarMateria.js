import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { Prisma } from "@prisma/client";
import { actualizarMateria } from "../../../dominio/materia/validacionMateria.js";
import { extraerBaseCodigo, makeCodigoMateria } from "../../../dominio/materia/helpersMateria.js";
import { generarCodigoUnicoCasoUso } from "./codigoUnicoMateria.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { materiaRepositorio } from "../../../infrastructure/repositories/repositorioMateria.js";

export async function actualizarMateriaCasoUso(id, payload) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("ID inválido", 400);

    const data = actualizarMateria.parse(payload);

    const current = await prisma.materia.findUnique({
        where: { id },
        select: { id: true, nombre: true, codigo: true, idCarrera: true, semestreId: true },
    });
    if (!current) throw crearError("Materia no encontrada", 404);

    if (data.idCarrera !== undefined) {
        const carrera = await prisma.carrera.findUnique({ where: { id: data.idCarrera }, select: { id: true } });
        if (!carrera) throw crearError("La carrera indicada no existe", 404);
    }

    if (data.semestreId !== undefined) {
        const s = data.semestreId;
        if (s) {
            const semestre = await prisma.semestre.findUnique({
                where: { id: s },
                select: { id: true, carreraId: true },
            });
            if (!semestre) throw crearError("El semestre indicado no existe", 404);

            const carreraFinal = data.idCarrera ?? current.idCarrera;
            if (semestre.carreraId !== carreraFinal) {
                throw crearError("El semestre no pertenece a la carrera seleccionada", 400);
            }
        }
    }

    const update = {
        ...(data.nombre !== undefined ? { nombre: data.nombre } : {}),
        ...(data.idCarrera !== undefined ? { idCarrera: data.idCarrera } : {}),
        ...(data.semestreId !== undefined ? { semestreId: data.semestreId } : {}),
    };

    if (data.nombre !== undefined) {
        const newBase = makeCodigoMateria(data.nombre) || "MAT";
        const prevBase = extraerBaseCodigo(current.codigo || "");
        if (newBase !== prevBase) {
            update.codigo = await generarCodigoUnicoCasoUso(newBase);
        }
    }

    try {
        return await materiaRepositorio.actualizar(id, update);
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            throw crearError("El código de la materia ya existe", 409);
        }
        throw e;
    }
}
