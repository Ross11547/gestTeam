import { crearProyecto } from "../../../dominio/proyecto/validacionProyecto.js";
import { normalizarTexto, crearError } from "../../../dominio/proyecto/helpersProyecto.js";
import { proyectoRepositorio } from "../../../infrastructure/repositories/repositorioProyecto.js";
import { sembrarHitosBaseInterno } from "../hito/sembrarHitosBase.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { puedeCrearProyecto } from "../../../dominio/comun/autoridadProyecto.js";

export async function crearProyectoCasoUso(payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const autorizado = await puedeCrearProyecto(usuario);
    if (!autorizado) throw crearError("No tienes permisos para crear proyectos", 403);

    const body = crearProyecto.parse(payload);

    const titulo = normalizarTexto(body.titulo);
    const descripcion = body.descripcion !== undefined ? normalizarTexto(body.descripcion) : "";

    const creadoPorId = usuario.id;

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
