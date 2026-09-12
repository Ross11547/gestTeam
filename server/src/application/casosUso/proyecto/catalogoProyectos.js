import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { proyectoRepositorio } from "../../../infrastructure/repositories/repositorioProyecto.js";

const ESTADOS = ["ACTIVO", "CERRADO", "INCONCLUSO"];
const TIPOS_GRUPO = ["INDIVIDUAL", "GRUPAL", "COLABORATIVO"];
const ORDENES = ["recientes", "antiguos", "titulo"];
const CAMPOS_QUERY = new Set([
    "texto", "facultadId", "carreraId", "periodoId", "materiaId", "estado",
    "tipoGrupo", "integrador", "categoria", "propios", "destacado", "pagina", "limite", "orden",
]);

const ESTADO_LABEL = {
    ACTIVO: "En proceso",
    CERRADO: "Terminado",
    INCONCLUSO: "Inconcluso",
};

const TIPO_LABEL = {
    INDIVIDUAL: "Individual",
    GRUPAL: "Grupal",
    COLABORATIVO: "Colaborativo",
};

function valorSimple(valor, nombre) {
    if (Array.isArray(valor) || (valor !== undefined && typeof valor !== "string")) {
        throw crearError(`${nombre} inválido`, 400);
    }
    return valor;
}

function idOpcional(valor, nombre) {
    if (valor === undefined) return null;
    valorSimple(valor, nombre);
    if (!/^\d+$/.test(valor)) throw crearError(`${nombre} inválido`, 400);
    const id = Number(valor);
    if (!Number.isSafeInteger(id) || id <= 0) throw crearError(`${nombre} inválido`, 400);
    return id;
}

function entero(valor, nombre, porDefecto, maximo = null) {
    if (valor === undefined) return porDefecto;
    const numero = idOpcional(valor, nombre);
    if (maximo && numero > maximo) throw crearError(`${nombre} inválido`, 400);
    return numero;
}

function booleanoOpcional(valor, nombre) {
    if (valor === undefined) return null;
    valorSimple(valor, nombre);
    if (valor !== "true" && valor !== "false") throw crearError(`${nombre} inválido`, 400);
    return valor === "true";
}

function validarFiltros(query = {}) {
    for (const campo of Object.keys(query)) {
        if (!CAMPOS_QUERY.has(campo)) throw crearError(`Parámetro ${campo} no permitido`, 400);
    }

    const textoValor = valorSimple(query.texto, "texto");
    const texto = String(textoValor || "").trim();
    if (texto.length > 200) throw crearError("texto inválido", 400);

    const estadoValor = valorSimple(query.estado, "estado");
    const estado = estadoValor ? estadoValor.trim().toUpperCase() : null;
    if (estado && !ESTADOS.includes(estado)) throw crearError("estado inválido", 400);

    const tipoValor = valorSimple(query.tipoGrupo, "tipoGrupo");
    const tipoGrupo = tipoValor ? tipoValor.trim().toUpperCase() : null;
    if (tipoGrupo && !TIPOS_GRUPO.includes(tipoGrupo)) throw crearError("tipoGrupo inválido", 400);

    const categoriaValor = valorSimple(query.categoria, "categoria");
    const categoria = categoriaValor ? categoriaValor.trim().toUpperCase() : null;
    if (categoria && !["INTEGRADOR", "REGULAR", "TODOS"].includes(categoria)) {
        throw crearError("categoria inválido", 400);
    }

    let integrador = booleanoOpcional(query.integrador, "integrador");
    if (categoria === "INTEGRADOR") integrador = true;
    if (categoria === "REGULAR") integrador = false;

    const ordenValor = valorSimple(query.orden, "orden");
    const orden = ordenValor ? ordenValor.trim().toLowerCase() : "recientes";
    if (!ORDENES.includes(orden)) throw crearError("orden inválido", 400);

    return {
        texto,
        facultadId: idOpcional(query.facultadId, "facultadId"),
        carreraId: idOpcional(query.carreraId, "carreraId"),
        periodoId: idOpcional(query.periodoId, "periodoId"),
        materiaId: idOpcional(query.materiaId, "materiaId"),
        estado,
        tipoGrupo,
        integrador,
        propios: booleanoOpcional(query.propios, "propios"),
        destacado: booleanoOpcional(query.destacado, "destacado"),
        pagina: entero(query.pagina, "pagina", 1),
        limite: entero(query.limite, "limite", 20, 50),
        orden,
    };
}

function predicadoCatalogo(filtros = null, usuarioId = null) {
    const where = { estado: { in: ESTADOS } };
    if (!filtros) return where;

    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.tipoGrupo) where.tipoGrupo = filtros.tipoGrupo;
    if (filtros.texto) {
        where.OR = [
            { titulo: { contains: filtros.texto, mode: "insensitive" } },
            { descripcion: { contains: filtros.texto, mode: "insensitive" } },
            { proyectosMateria: { some: { materia: { nombre: { contains: filtros.texto, mode: "insensitive" } } } } },
            { proyectosMateria: { some: { materia: { codigo: { contains: filtros.texto, mode: "insensitive" } } } } },
        ];
    }

    const contexto = {};
    if (filtros.facultadId) contexto.materia = { carrera: { idFacultad: filtros.facultadId } };
    if (filtros.carreraId) contexto.materia = { ...(contexto.materia || {}), idCarrera: filtros.carreraId };
    if (filtros.materiaId) contexto.materiaId = filtros.materiaId;
    if (filtros.periodoId) contexto.periodoId = filtros.periodoId;
    if (filtros.integrador === true) {
        contexto.materia = { ...(contexto.materia || {}), esIntegrador: true };
    }
    if (Object.keys(contexto).length) where.proyectosMateria = { some: contexto };
    if (filtros.integrador === false) {
        where.AND = [{ proyectosMateria: { none: { materia: { esIntegrador: true } } } }];
    }
    if (filtros.destacado === true) {
        where.proyectoDestacado = { isNot: null };
    }
    if (filtros.propios === true) {
        where.AND = [
            ...(where.AND || []),
            {
                OR: [
                    { miembros: { some: { usuarioId } } },
                    { equipos: { some: { miembros: { some: { usuarioId, activo: true } } } } },
                ],
            },
        ];
    }
    return where;
}

function inscripcionUtilizable(inscripcion) {
    return !inscripcion.claseId || (
        inscripcion.clase?.activo
        && inscripcion.clase.periodoId === inscripcion.periodoId
        && inscripcion.clase.materiaId === inscripcion.materiaId
    );
}

function contextoAutorizado(proyecto, usuario) {
    const rol = String(usuario?.rol?.nombre || "").trim().toLowerCase();
    const ordenados = [...proyecto.periodos].sort((a, b) => {
        if (a.periodo.activo !== b.periodo.activo) return a.periodo.activo ? -1 : 1;
        const fechaA = a.periodo.fechaFin?.getTime() || a.periodo.fechaIni?.getTime() || a.createdAt.getTime();
        const fechaB = b.periodo.fechaFin?.getTime() || b.periodo.fechaIni?.getTime() || b.createdAt.getTime();
        return fechaB - fechaA || b.id - a.id;
    });

    return ordenados.find((periodo) => {
        if (rol === "admin") return true;
        if (periodo.equipos.some((equipo) => equipo.miembros.length > 0)) return true;
        if (rol === "docente") {
            return periodo.proyectosMateria.some((vinculo) => vinculo.clase?.docenteId === usuario.id);
        }
        if (rol === "director" && usuario.idCarrera) {
            return periodo.proyectosMateria.some(
                (vinculo) => Number(vinculo.materia.idCarrera) === Number(usuario.idCarrera)
            );
        }
        return false;
    }) || null;
}

function valoresUnicos(valores) {
    return [...new Map(valores.map((valor) => [valor.id, valor])).values()];
}

function crearDto(proyecto, usuario, puedeContinuar) {
    const materias = valoresUnicos(proyecto.proyectosMateria.map(({ materia }) => ({
        id: materia.id,
        nombre: materia.nombre,
        codigo: materia.codigo,
    })));
    const carreras = valoresUnicos(proyecto.proyectosMateria.map(({ materia }) => ({
        id: materia.carrera.id,
        nombre: materia.carrera.nombre,
    })));
    const facultades = valoresUnicos(proyecto.proyectosMateria.map(({ materia }) => ({
        id: materia.carrera.facultad.id,
        nombre: materia.carrera.facultad.nombre,
    })));
    const periodos = valoresUnicos(proyecto.proyectosMateria
        .filter(({ periodo }) => periodo)
        .map(({ periodo }) => periodo));
    const esIntegrador = proyecto.proyectosMateria.some(({ materia }) => materia.esIntegrador);
    const contexto = contextoAutorizado(proyecto, usuario);

    return {
        id: proyecto.id,
        titulo: proyecto.titulo,
        descripcion: proyecto.descripcion || "",
        estado: proyecto.estado,
        estadoLabel: ESTADO_LABEL[proyecto.estado],
        tipoGrupo: proyecto.tipoGrupo,
        tipoLabel: TIPO_LABEL[proyecto.tipoGrupo],
        esIntegrador,
        categoria: esIntegrador ? "INTEGRADOR" : "REGULAR",
        facultades,
        carreras,
        materias,
        periodos,
        participa: proyecto.miembros.length > 0 || proyecto.equipos.length > 0,
        puedeAbrirWorkspace: Boolean(contexto),
        proyectoPeriodoId: contexto?.id || null,
        puedeIniciarContinuacion: puedeContinuar && proyecto.estado === "INCONCLUSO",
        puedeSolicitarContinuacion: puedeContinuar && proyecto.estado === "INCONCLUSO",
        esDestacado: Boolean(proyecto.proyectoDestacado),
        motivoDestacado: proyecto.proyectoDestacado?.motivo || null,
    };
}

async function usuarioPuedeContinuar(usuario) {
    const rol = String(usuario?.rol?.nombre || "").trim().toLowerCase();
    if (rol !== "estudiante") return false;
    const inscripciones = await proyectoRepositorio.listarInscripcionesActivas(usuario.id);
    return inscripciones.some(inscripcionUtilizable);
}

export async function listarCatalogoProyectosCasoUso(query, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);
    const filtros = validarFiltros(query);
    const orderBy = filtros.orden === "antiguos"
        ? [{ createdAt: "asc" }, { id: "asc" }]
        : filtros.orden === "titulo"
            ? [{ titulo: "asc" }, { id: "asc" }]
            : [{ createdAt: "desc" }, { id: "desc" }];
    const [{ total, proyectos }, puedeContinuar] = await Promise.all([
        proyectoRepositorio.listarCatalogo({
            where: predicadoCatalogo(filtros, usuario.id),
            orderBy,
            skip: (filtros.pagina - 1) * filtros.limite,
            take: filtros.limite,
            usuarioId: usuario.id,
        }),
        usuarioPuedeContinuar(usuario),
    ]);

    return {
        proyectos: proyectos.map((proyecto) => crearDto(proyecto, usuario, puedeContinuar)),
        paginacion: {
            pagina: filtros.pagina,
            limite: filtros.limite,
            total,
            totalPaginas: Math.ceil(total / filtros.limite),
        },
    };
}

export async function obtenerCatalogoProyectoCasoUso(id, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);
    const [proyecto, puedeContinuar] = await Promise.all([
        proyectoRepositorio.obtenerCatalogoPorId(id, usuario.id, predicadoCatalogo()),
        usuarioPuedeContinuar(usuario),
    ]);
    if (!proyecto) throw crearError("Proyecto no encontrado", 404);
    return crearDto(proyecto, usuario, puedeContinuar);
}
