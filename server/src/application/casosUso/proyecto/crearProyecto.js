import { crearProyecto } from "../../../dominio/proyecto/validacionProyecto.js";
import { normalizarTexto } from "../../../dominio/proyecto/helpersProyecto.js";
import { proyectoRepositorio } from "../../../infrastructure/repositories/repositorioProyecto.js";
import { sembrarHitosBaseInterno } from "../hito/sembrarHitosBase.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function crearProyectoCasoUso(payload, usuario) {
    const body = crearProyecto.parse(payload);

    const titulo = normalizarTexto(body.titulo);
    const descripcion = body.descripcion !== undefined ? normalizarTexto(body.descripcion) : "";

    // El creador queda registrado y como OWNER para que el proyecto sea editable.
    const creadoPorId = usuario?.id ?? null;

    const proyecto = await proyectoRepositorio.crear({
        titulo,
        descripcion,
        codigoMateria: body.codigoMateria ? normalizarTexto(body.codigoMateria) : null,
        tipoGrupo: body.tipoGrupo ?? undefined, // Prisma pondrá el default si no mandas nada
        estado: body.estado ?? undefined,       // Prisma pondrá el default si no mandas nada
        repoUrl: body.repoUrl ? body.repoUrl.trim() : null,
        creadoPorId,
    });

    if (creadoPorId) {
        try {
            await prisma.miembroProyecto.create({
                data: { proyectoId: proyecto.id, usuarioId: creadoPorId, rol: "OWNER" },
            });
        } catch {
            // si ya era miembro u otro error, no invalida la creación
        }
    }

    // Todo proyecto nuevo nace con sus 5 hitos del semestre.
    // Best-effort: nunca debe romper la creación del proyecto.
    try {
        await sembrarHitosBaseInterno(proyecto.id);
    } catch {
        // siembra fallida no invalida el proyecto creado
    }

    return proyecto;
}
