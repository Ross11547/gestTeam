import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";
import { ensureIdPositivo, crearError } from "../../../dominio/equipo/helpersEquipo.js";

export async function listarEquiposCasoUso(query = {}) {
    const filtros = {};

    if (query.proyectoId !== undefined && query.proyectoId !== "") {
        const id = ensureIdPositivo(query.proyectoId);
        if (!id) throw crearError("proyectoId inválido");
        filtros.proyectoId = id;
    }

    if (query.materiaId !== undefined && query.materiaId !== "") {
        const id = ensureIdPositivo(query.materiaId);
        if (!id) throw crearError("materiaId inválido");
        filtros.materiaId = id;
    }

    if (query.periodoId !== undefined && query.periodoId !== "") {
        const id = ensureIdPositivo(query.periodoId);
        if (!id) throw crearError("periodoId inválido");
        filtros.periodoId = id;
    }

    return equipoRepositorio.listar(filtros);
}
