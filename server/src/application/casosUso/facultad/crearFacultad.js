import { Prisma } from "@prisma/client";
import { crearFacultad, parseTheme } from "../../../dominio/facultad/validacionFacultad.js";
import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { facultadRepositorio } from "../../../infrastructure//repositories/repositorioFacultad.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function crearFacultadCasoUso(payload) {
    const data = crearFacultad.parse(payload);

    // si mandan institucionId, validar que exista
    if (data.institucionId) {
        const inst = await prisma.institucion.findUnique({
            where: { id: data.institucionId },
            select: { id: true },
        });
        if (!inst) throw crearError("La institución no existe", 404);
    }

    // validación lógica (además del @@unique)
    const yaExiste = await facultadRepositorio.existePorNombreEnInstitucion(
        data.institucionId ?? null,
        data.nombre
    );
    if (yaExiste) throw crearError("Ya existe una facultad con ese nombre en la institución", 409);

    try {
        return await facultadRepositorio.crear({
            institucionId: data.institucionId ?? null,
            nombre: data.nombre,
            theme: parseTheme(data.theme),
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            throw crearError("Ya existe una facultad con ese nombre en la institución", 409);
        }
        throw e;
    }
}
