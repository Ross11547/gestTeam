import { crearProyecto } from "../../../dominio/proyecto/validacionProyecto.js";
import { normalizarTexto } from "../../../dominio/proyecto/helpersProyecto.js";
import { proyectoRepositorio } from "../../../infrastructure/repositories/repositorioProyecto.js";
import { sembrarHitosBaseInterno } from "../hito/sembrarHitosBase.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function crearProyectoCasoUso(payload, usuario) {
    const body = crearProyecto.parse(payload);

    const titulo = normalizarTexto(body.titulo);
    const descripcion = body.descripcion !== undefined ? normalizarTexto(body.descripcion) : "";

    const creadoPorId = usuario?.id ?? null;

    const proyecto = await proyectoRepositorio.crear({
        titulo,
        descripcion,
        codigoMateria: body.codigoMateria ? normalizarTexto(body.codigoMateria) : null,
        tipoGrupo: body.tipoGrupo ?? undefined,
        estado: body.estado ?? undefined,      
        repoUrl: body.repoUrl ? body.repoUrl.trim() : null,
        creadoPorId,
    });

    if (creadoPorId) {
        try {
            await prisma.miembroProyecto.create({
                data: { proyectoId: proyecto.id, usuarioId: creadoPorId, rol: "OWNER" },
            });
        } catch {
        }
    }

    try {
        await sembrarHitosBaseInterno(proyecto.id);
    } catch {
    }

    return proyecto;
}
