import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { crearPeriodoAcademico } from "../../../dominio/periodoAcademico/vlidacionPeriodoAcademico.js";
import { periodoAcademicoRepositorio } from "../../../infrastructure/repositories/repositorioPeriodoAcademico.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

const HITOS_INSTITUCIONALES = [
    { orden: 1, nombre: "H1 - Nivelación" },
    { orden: 2, nombre: "H2 - Avance evaluable" },
    { orden: 3, nombre: "H3 - Avance evaluable" },
    { orden: 4, nombre: "H4 - Avance evaluable" },
    { orden: 5, nombre: "H5 - Ajustes finales / presentación / cierre del semestre" },
];

export async function crearPeriodoAcademicoCasoUso(payload) {
    const data = crearPeriodoAcademico.parse(payload);

    const ini = new Date(data.fechaIni);
    const fin = new Date(data.fechaFin);
    if (!(fin > ini)) {
        throw crearError("fechaFin debe ser mayor que fechaIni", 400);
    }

    const inst = await prisma.institucion.findUnique({
        where: { id: data.institucionId },
        select: { id: true },
    });
    if (!inst) throw crearError("La institución no existe", 404);

    const existeNombre = await periodoAcademicoRepositorio.existeNombreEnInstitucion(
        data.institucionId,
        data.nombre
    );
    if (existeNombre) throw crearError("Ya existe un periodo con ese nombre en la institución", 409);

    return prisma.$transaction(async (tx) => {
        if (data.activo === true) {
            await tx.periodoAcademico.updateMany({
                where: { institucionId: data.institucionId, activo: true },
                data: { activo: false },
            });
        }

        const periodo = await tx.periodoAcademico.create({
            data: {
                institucionId: data.institucionId,
                nombre: data.nombre,
                fechaIni: ini,
                fechaFin: fin,
                activo: data.activo ?? false,
            },
            include: { institucion: { select: { id: true, nombre: true, slug: true } } },
        });

        await tx.hitoPeriodo.createMany({
            data: HITOS_INSTITUCIONALES.map((h) => ({
                periodoId: periodo.id,
                orden: h.orden,
                nombre: h.nombre,
                descripcion: null,
                pesoSugerido: null,
            })),
        });

        return tx.periodoAcademico.findUnique({
            where: { id: periodo.id },
            include: {
                institucion: { select: { id: true, nombre: true, slug: true } },
                hitosPeriodo: { orderBy: { orden: "asc" } },
            },
        });
    });
}
