import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError } from "../../../dominio/comun/helpersComunes.js";

const SELECCION_MATERIA = {
    id: true,
    nombre: true,
    codigo: true,
    idCarrera: true,
    semestreId: true,
    carrera: { select: { id: true, nombre: true } },
    semestre: { select: { id: true, numero: true, etiqueta: true } },
};

export async function listarMateriasMiasCasoUso(usuario) {
    const uid = Number(usuario?.id);
    if (!uid) throw crearError("No autenticado", 401);

    const usuarioDb = await prisma.usuario.findUnique({
        where: { id: uid },
        select: {
            id: true,
            idCarrera: true,
            semestreId: true,
            rol: { select: { nombre: true } },
        },
    });
    if (!usuarioDb) throw crearError("Usuario no encontrado", 404);

    const rolNombre = String(usuarioDb.rol?.nombre || "").trim().toLowerCase();
    if (rolNombre === "docente") {
        const asignaciones = await prisma.docenteMateria.findMany({
            where: { usuarioId: uid },
            orderBy: { materiaId: "asc" },
            select: { materia: SELECCION_MATERIA },
        });
        return asignaciones.map((a) => a.materia).filter(Boolean);
    }

    if (!usuarioDb.idCarrera) throw crearError("El usuario no tiene carrera asignada", 400);
    if (!usuarioDb.semestreId) throw crearError("El usuario no tiene semestre asignado", 400);

    return prisma.materia.findMany({
        where: {
            idCarrera: usuarioDb.idCarrera,
            semestreId: usuarioDb.semestreId,
        },
        select: SELECCION_MATERIA,
        orderBy: [{ codigo: "asc" }, { nombre: "asc" }],
    });
}
