import { proyectoRepositorio } from "../../../infrastructure/repositories/repositorioProyecto.js";
import { crearError } from "../../../dominio/proyecto/helpersProyecto.js";

const etiquetasEstado = {
    ACTIVO: "En proceso",
    CERRADO: "Terminado",
    INCONCLUSO: "Inconcluso",
};

function idFiltro(valor, nombre) {
    if (valor === undefined || valor === null || valor === "") return null;
    const id = Number(valor);
    if (!Number.isInteger(id) || id <= 0) throw crearError(`${nombre} inválido`, 400);
    return id;
}

export async function listarCatalogoIntegradoresCasoUso(filtros = {}) {
    const estado = filtros.estado ? String(filtros.estado).trim().toUpperCase() : null;
    if (estado && !etiquetasEstado[estado]) throw crearError("estado inválido", 400);

    const periodoId = idFiltro(filtros.periodoId, "periodoId");
    const materiaId = idFiltro(filtros.materiaId, "materiaId");
    const texto = String(filtros.texto || "").trim();

    const contextoIntegrador = { materia: { esIntegrador: true } };
    if (periodoId) contextoIntegrador.periodoId = periodoId;
    if (materiaId) contextoIntegrador.materiaId = materiaId;

    const where = {
        proyectosMateria: { some: contextoIntegrador },
    };
    if (estado) where.estado = estado;
    if (texto) {
        where.OR = [
            { titulo: { contains: texto, mode: "insensitive" } },
            { descripcion: { contains: texto, mode: "insensitive" } },
        ];
    }

    const proyectos = await proyectoRepositorio.listarCatalogoIntegradores(where);

    return proyectos.map((proyecto) => {
        const periodos = new Map();
        const materiasIntegradoras = new Map();
        for (const contexto of proyecto.proyectosMateria) {
            if (contexto.periodo) periodos.set(contexto.periodo.id, contexto.periodo);
            materiasIntegradoras.set(contexto.materia.id, contexto.materia);
        }

        return {
            id: proyecto.id,
            titulo: proyecto.titulo,
            descripcion: proyecto.descripcion,
            estado: proyecto.estado,
            etiqueta: etiquetasEstado[proyecto.estado],
            periodos: [...periodos.values()],
            materiasIntegradoras: [...materiasIntegradoras.values()],
        };
    });
}
