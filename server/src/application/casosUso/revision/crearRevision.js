import { crearRevision } from "../../../dominio/revision/validacionRevision.js";
import { normalizarTexto, crearError } from "../../../dominio/revision/helpersRevision.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { puedeCrearRevision } from "../../../dominio/comun/autoridadRecursoAcademico.js";

export async function crearRevisionCasoUso(payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const data = crearRevision.parse(payload);

    const entrega = await prisma.entregaHito.findUnique({
        where: { id: data.entregaId },
        select: { id: true, estado: true },
    });

    if (!entrega) throw crearError("La entrega indicada no existe", 404);

    if (entrega.estado === "REVISADO") {
        throw crearError("Esta entrega ya fue revisada", 409);
    }

    const autorizado = await puedeCrearRevision(data.entregaId, usuario);
    if (!autorizado) {
        throw crearError("No tienes permisos para revisar esta entrega", 403);
    }

    const revision = await prisma.$transaction(async (tx) => {
        const r = await tx.revisionEntrega.create({
            data: {
                entregaId: data.entregaId,
                revisorId: usuario.id,
                nota: data.nota ?? null,
                feedback: data.feedback !== undefined ? normalizarTexto(data.feedback) : "",
            },
        });

        await tx.entregaHito.update({
            where: { id: data.entregaId },
            data: { estado: "REVISADO" },
        });

        return r;
    });

    return revision;
}
