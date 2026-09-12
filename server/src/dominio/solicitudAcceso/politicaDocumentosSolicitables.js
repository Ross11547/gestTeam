export const ESTADOS_PROYECTO_SOLICITABLES = ["ACTIVO", "CERRADO", "INCONCLUSO"];
export const ESTADOS_ENTREGA_SOLICITABLES = ["ENTREGADO", "REVISADO"];

export function estudianteEsAjenoAlProyecto(proyecto, usuarioId) {
    return proyecto.creadoPorId !== usuarioId
        && proyecto.miembros.length === 0
        && proyecto.equipos.length === 0;
}

export function filtroDocumentosSolicitables(proyectoId, proyectoMateriaId = null, documentoIds = null) {
    const equipo = {
        proyectoId,
        proyectoMateriaId: proyectoMateriaId ?? { not: null },
        proyectoMateria: { is: { proyectoId } },
    };

    return {
        ...(documentoIds ? { id: { in: documentoIds } } : {}),
        entrega: {
            is: {
                estado: { in: ESTADOS_ENTREGA_SOLICITABLES },
                equipo: { is: equipo },
            },
        },
    };
}
