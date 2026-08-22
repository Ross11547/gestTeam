import { guardarContenido } from "../../../dominio/pizarra/validacionesPizarra.js";
import { ErrorConflicto, ErrorValidacion } from "../../../dominio/pizarra/erroresPizarra.js";
import { obtenerPizarraParaEscritura } from "../../../dominio/pizarra/autorizacionPizarra.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

function validarJsonObjeto(dataJson) {
    if (!dataJson || typeof dataJson !== "object" || Array.isArray(dataJson)) {
        throw new ErrorValidacion("dataJson debe ser un objeto JSON válido");
    }
}

export async function guardarContenidoPizarraCasoUso(id, payload, usuario) {
    const num = Number(id);
    if (!Number.isInteger(num) || num <= 0) throw new ErrorValidacion("id inválido");

    const parsed = guardarContenido.safeParse(payload);
    if (!parsed.success) throw new ErrorValidacion("Datos inválidos", parsed.error.flatten());

    const { dataJson, version } = parsed.data;
    validarJsonObjeto(dataJson);

    await obtenerPizarraParaEscritura(num, usuario);

    const resultado = await prisma.pizarra.updateMany({
        where: { id: num, version },
        data: {
            dataJson,
            version: { increment: 1 },
        },
    });

    if (resultado.count === 0) {
        const actual = await prisma.pizarra.findUnique({ where: { id: num }, select: { version: true } });
        throw new ErrorConflicto("La pizarra cambió. Recarga antes de guardar.", { versionActual: actual?.version ?? null });
    }

    return prisma.pizarra.findUnique({
        where: { id: num },
        select: { id: true, version: true, updatedAt: true },
    });
}
