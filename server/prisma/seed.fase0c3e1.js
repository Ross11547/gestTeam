import { config } from "dotenv";
config({ path: ".env.test", override: true });

function validarEntornoDePrueba() {
    const env = String(process.env.NODE_ENV || "").trim().toLowerCase();
    const dbUrl = String(process.env.DATABASE_URL || "").trim();

    if (!dbUrl) {
        throw new Error("[SEED] DATABASE_URL no está definida. Abortando.");
    }

    let dbName = "";
    try {
        const url = new URL(dbUrl);
        dbName = url.pathname.replace(/^\//, "").replace(/\?.*$/, "");
    } catch {
        throw new Error("[SEED] DATABASE_URL no es una URL válida. Abortando.");
    }

    if (dbName !== "gestteam_test") {
        throw new Error(
            `[SEED] Protección activa: la base de datos destino es "${dbName}", no "gestteam_test". Abortando.`
        );
    }

    if (env && env !== "test") {
        throw new Error(`[SEED] NODE_ENV="${env}" no es "test". Abortando.`);
    }

    console.log("[SEED] Entorno de prueba validado (gestteam_test).");
}

validarEntornoDePrueba();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const PASSWORD_HASH = await bcrypt.hash("TestPass0C3E1!", 10);

async function limpiar(client = prisma) {
    const tablas = [
        "EvaluacionHito",
        "SolicitudContinuacionProyecto",
        "HitoProyecto",
        "HitoPeriodo",
        "EquipoMiembro",
        "Equipo",
        "ProyectoMateria",
        "ProyectoPeriodo",
        "MiembroProyecto",
        "Proyecto",
        "InscripcionMateria",
        "DocenteMateria",
        "ClaseMateria",
        "Materia",
        "PeriodoAcademico",
        "Semestre",
        "Carrera",
        "Facultad",
        "Institucion",
        "Usuario",
        "Rol",
    ];
    await client.$executeRawUnsafe(`TRUNCATE ${tablas.map((t) => `"${t}"`).join(", ")} CASCADE;`);
}

async function seedFase0C3E1(client = prisma) {
    await limpiar(client);

    const roles = await client.rol.createMany({
        data: [
            { nombre: "Admin" },
            { nombre: "Director" },
            { nombre: "Docente" },
            { nombre: "Estudiante" },
        ],
        skipDuplicates: true,
    });
    const rolMap = Object.fromEntries(
        (await client.rol.findMany()).map((r) => [r.nombre, r.id])
    );

    const institucion = await client.institucion.create({
        data: { nombre: "Universidad de Prueba Fase 0C3E1", slug: "univ-test-0c3e1", activo: true },
    });

    const facultadSistemas = await client.facultad.create({
        data: { institucionId: institucion.id, nombre: "Ingeniería de Sistemas" },
    });

    const carreraSistemas = await client.carrera.create({
        data: { idFacultad: facultadSistemas.id, nombre: "Ingeniería de sistemas", sigla: "SIS" },
    });

    const semestre5 = await client.semestre.create({
        data: { carreraId: carreraSistemas.id, numero: 5, etiqueta: "Quinto semestre" },
    });

    const periodo2026_1 = await client.periodoAcademico.create({
        data: {
            institucionId: institucion.id,
            nombre: "2026-1",
            fechaIni: new Date("2026-01-01"),
            fechaFin: new Date("2026-06-30"),
            activo: false,
        },
    });

    const periodo2026_2 = await client.periodoAcademico.create({
        data: {
            institucionId: institucion.id,
            nombre: "2026-2",
            fechaIni: new Date("2026-07-01"),
            fechaFin: new Date("2026-12-31"),
            activo: true,
        },
    });

    const materiaIntegrador1 = await client.materia.create({
        data: { idCarrera: carreraSistemas.id, semestreId: semestre5.id, nombre: "Proyecto Integrador I", codigo: "PI1", esIntegrador: true },
    });

    const materiaIntegrador2 = await client.materia.create({
        data: { idCarrera: carreraSistemas.id, semestreId: semestre5.id, nombre: "Proyecto Integrador II", codigo: "PI2", esIntegrador: true },
    });

    const materiaPsicologia = await client.materia.create({
        data: { idCarrera: carreraSistemas.id, semestreId: semestre5.id, nombre: "Psicología Aplicada", codigo: "PSI", esIntegrador: false },
    });

    const admin = await client.usuario.create({
        data: { nombre: "Admin", apellido: "Test", telefono: "70000001", ci: 2000001, correo: "admin.0c3e1@unifranz.edu.bo", password: PASSWORD_HASH, idRol: rolMap.Admin, activo: true },
    });

    const directorSistemas = await client.usuario.create({
        data: { nombre: "Director", apellido: "Sistemas", telefono: "70000002", ci: 2000002, correo: "director.sistemas.0c3e1@unifranz.edu.bo", password: PASSWORD_HASH, idRol: rolMap.Director, activo: true, esDirector: true, idFacultad: facultadSistemas.id, idCarrera: carreraSistemas.id },
    });

    const docenteIntegrador = await client.usuario.create({
        data: { nombre: "Docente", apellido: "Integrador", telefono: "70000003", ci: 2000003, correo: "docente.integrador.0c3e1@unifranz.edu.bo", password: PASSWORD_HASH, idRol: rolMap.Docente, activo: true },
    });

    const docentePsicologia = await client.usuario.create({
        data: { nombre: "Docente", apellido: "Psicologia", telefono: "70000004", ci: 2000004, correo: "docente.psicologia.0c3e1@unifranz.edu.bo", password: PASSWORD_HASH, idRol: rolMap.Docente, activo: true },
    });

    const estudianteA = await client.usuario.create({
        data: { nombre: "Estudiante", apellido: "A", telefono: "70000005", ci: 2000005, correo: "estudiante.a.0c3e1@unifranz.edu.bo", password: PASSWORD_HASH, idRol: rolMap.Estudiante, activo: true, idFacultad: facultadSistemas.id, idCarrera: carreraSistemas.id, semestreId: semestre5.id },
    });

    const estudianteB = await client.usuario.create({
        data: { nombre: "Estudiante", apellido: "B", telefono: "70000006", ci: 2000006, correo: "estudiante.b.0c3e1@unifranz.edu.bo", password: PASSWORD_HASH, idRol: rolMap.Estudiante, activo: true, idFacultad: facultadSistemas.id, idCarrera: carreraSistemas.id, semestreId: semestre5.id },
    });

    const estudianteC = await client.usuario.create({
        data: { nombre: "Estudiante", apellido: "C", telefono: "70000007", ci: 2000007, correo: "estudiante.c.0c3e1@unifranz.edu.bo", password: PASSWORD_HASH, idRol: rolMap.Estudiante, activo: true, idFacultad: facultadSistemas.id, idCarrera: carreraSistemas.id, semestreId: semestre5.id },
    });

    const estudianteD = await client.usuario.create({
        data: { nombre: "Estudiante", apellido: "D", telefono: "70000008", ci: 2000008, correo: "estudiante.d.0c3e1@unifranz.edu.bo", password: PASSWORD_HASH, idRol: rolMap.Estudiante, activo: true, idFacultad: facultadSistemas.id, idCarrera: carreraSistemas.id, semestreId: semestre5.id },
    });

    const claseIntegrador1 = await client.claseMateria.create({
        data: { periodoId: periodo2026_1.id, materiaId: materiaIntegrador1.id, docenteId: docenteIntegrador.id, paralelo: "A" },
    });

    const claseIntegrador2 = await client.claseMateria.create({
        data: { periodoId: periodo2026_2.id, materiaId: materiaIntegrador2.id, docenteId: docenteIntegrador.id, paralelo: "A" },
    });

    const clasePsicologia = await client.claseMateria.create({
        data: { periodoId: periodo2026_2.id, materiaId: materiaPsicologia.id, docenteId: docentePsicologia.id, paralelo: "A" },
    });

    await client.inscripcionMateria.create({
        data: {
            usuarioId: estudianteA.id,
            periodoId: periodo2026_2.id,
            claseId: claseIntegrador2.id,
            materiaId: materiaIntegrador2.id,
        },
    });

    await client.docenteMateria.createMany({
        data: [
            { usuarioId: docenteIntegrador.id, materiaId: materiaIntegrador1.id },
            { usuarioId: docenteIntegrador.id, materiaId: materiaIntegrador2.id },
            { usuarioId: docentePsicologia.id, materiaId: materiaPsicologia.id },
        ],
    });

    const hitos2026_1 = await crearHitosPeriodo(client, periodo2026_1.id, [
        { orden: 1, nombre: "Nivelación y bienvenida" },
        { orden: 2, nombre: "Propuesta y anteproyecto" },
        { orden: 3, nombre: "Avance intermedio" },
        { orden: 4, nombre: "Producto casi terminado" },
        { orden: 5, nombre: "Entrega final y defensa" },
    ]);

    const hitos2026_2 = await crearHitosPeriodo(client, periodo2026_2.id, [
        { orden: 1, nombre: "Nivelación y bienvenida" },
        { orden: 2, nombre: "Propuesta y anteproyecto" },
        { orden: 3, nombre: "Avance intermedio" },
        { orden: 4, nombre: "Producto casi terminado" },
        { orden: 5, nombre: "Entrega final y defensa" },
    ]);

    const proyectoX = await client.proyecto.create({
        data: { titulo: "Proyecto X - Continuidad", descripcion: "Trabajo que continúa entre semestres", tipoGrupo: "GRUPAL", estado: "ACTIVO", creadoPorId: estudianteA.id },
    });

    await client.miembroProyecto.createMany({
        data: [
            { proyectoId: proyectoX.id, usuarioId: estudianteA.id, rol: "OWNER" },
            { proyectoId: proyectoX.id, usuarioId: estudianteB.id, rol: "MEMBER" },
        ],
    });

    const ppX_2026_1 = await client.proyectoPeriodo.create({
        data: { proyectoId: proyectoX.id, periodoId: periodo2026_1.id, estado: "CERRADO_PERIODO" },
    });

    const pmX_2026_1 = await client.proyectoMateria.create({
        data: { proyectoId: proyectoX.id, materiaId: materiaIntegrador1.id, periodoId: periodo2026_1.id, claseId: claseIntegrador1.id, proyectoPeriodoId: ppX_2026_1.id },
    });

    const equipoX_2026_1 = await client.equipo.create({
        data: { proyectoId: proyectoX.id, proyectoPeriodoId: ppX_2026_1.id, proyectoMateriaId: pmX_2026_1.id, nombre: "Equipo X 2026-1", materiaId: materiaIntegrador1.id, periodoId: periodo2026_1.id, claseId: claseIntegrador1.id, creadoPorId: estudianteA.id },
    });

    await client.equipoMiembro.createMany({
        data: [
            { equipoId: equipoX_2026_1.id, usuarioId: estudianteA.id, rolEquipo: "LIDER", activo: true },
            { equipoId: equipoX_2026_1.id, usuarioId: estudianteB.id, rolEquipo: "MIEMBRO", activo: true },
        ],
    });

    await crearHitosProyecto(client, ppX_2026_1.id, hitos2026_1);

    const ppX_2026_2 = await client.proyectoPeriodo.create({
        data: { proyectoId: proyectoX.id, periodoId: periodo2026_2.id, estado: "ACTIVO" },
    });

    const pmX_2026_2 = await client.proyectoMateria.create({
        data: { proyectoId: proyectoX.id, materiaId: materiaIntegrador2.id, periodoId: periodo2026_2.id, claseId: claseIntegrador2.id, proyectoPeriodoId: ppX_2026_2.id },
    });

    const equipoX_2026_2 = await client.equipo.create({
        data: { proyectoId: proyectoX.id, proyectoPeriodoId: ppX_2026_2.id, proyectoMateriaId: pmX_2026_2.id, nombre: "Equipo X 2026-2", materiaId: materiaIntegrador2.id, periodoId: periodo2026_2.id, claseId: claseIntegrador2.id, creadoPorId: estudianteC.id },
    });

    await client.equipoMiembro.createMany({
        data: [
            { equipoId: equipoX_2026_2.id, usuarioId: estudianteC.id, rolEquipo: "LIDER", activo: true },
            { equipoId: equipoX_2026_2.id, usuarioId: estudianteD.id, rolEquipo: "MIEMBRO", activo: true },
        ],
    });

    await crearHitosProyecto(client, ppX_2026_2.id, hitos2026_2);

    const proyectoY = await client.proyecto.create({
        data: { titulo: "Proyecto Y - Colaborativo", descripcion: "Proyecto colaborativo Sistemas + Psicología", tipoGrupo: "COLABORATIVO", estado: "ACTIVO", creadoPorId: estudianteA.id },
    });

    const ppY_2026_2 = await client.proyectoPeriodo.create({
        data: { proyectoId: proyectoY.id, periodoId: periodo2026_2.id, estado: "ACTIVO" },
    });

    const pmY_Sistemas = await client.proyectoMateria.create({
        data: { proyectoId: proyectoY.id, materiaId: materiaIntegrador2.id, periodoId: periodo2026_2.id, claseId: claseIntegrador2.id, proyectoPeriodoId: ppY_2026_2.id },
    });

    const pmY_Psicologia = await client.proyectoMateria.create({
        data: { proyectoId: proyectoY.id, materiaId: materiaPsicologia.id, periodoId: periodo2026_2.id, claseId: clasePsicologia.id, proyectoPeriodoId: ppY_2026_2.id },
    });

    const equipoY_Sistemas = await client.equipo.create({
        data: { proyectoId: proyectoY.id, proyectoPeriodoId: ppY_2026_2.id, proyectoMateriaId: pmY_Sistemas.id, nombre: "Equipo Y Sistemas", materiaId: materiaIntegrador2.id, periodoId: periodo2026_2.id, claseId: claseIntegrador2.id, creadoPorId: estudianteA.id },
    });

    const equipoY_Psicologia = await client.equipo.create({
        data: { proyectoId: proyectoY.id, proyectoPeriodoId: ppY_2026_2.id, proyectoMateriaId: pmY_Psicologia.id, nombre: "Equipo Y Psicología", materiaId: materiaPsicologia.id, periodoId: periodo2026_2.id, claseId: clasePsicologia.id, creadoPorId: estudianteC.id },
    });

    await client.equipoMiembro.createMany({
        data: [
            { equipoId: equipoY_Sistemas.id, usuarioId: estudianteA.id, rolEquipo: "MIEMBRO", activo: true },
            { equipoId: equipoY_Psicologia.id, usuarioId: estudianteC.id, rolEquipo: "MIEMBRO", activo: true },
        ],
    });

    await crearHitosProyecto(client, ppY_2026_2.id, hitos2026_2);

    const proyectoZ = await client.proyecto.create({
        data: { titulo: "Proyecto Z - Inconcluso", descripcion: "Trabajo no concluido, potencialmente continuable", tipoGrupo: "GRUPAL", estado: "INCONCLUSO", creadoPorId: estudianteA.id },
    });

    return {
        ids: {
            institucion: institucion.id,
            facultadSistemas: facultadSistemas.id,
            carreraSistemas: carreraSistemas.id,
            periodo2026_1: periodo2026_1.id,
            periodo2026_2: periodo2026_2.id,
            materiaIntegrador1: materiaIntegrador1.id,
            materiaIntegrador2: materiaIntegrador2.id,
            materiaPsicologia: materiaPsicologia.id,
            admin: admin.id,
            directorSistemas: directorSistemas.id,
            docenteIntegrador: docenteIntegrador.id,
            docentePsicologia: docentePsicologia.id,
            estudianteA: estudianteA.id,
            estudianteB: estudianteB.id,
            estudianteC: estudianteC.id,
            estudianteD: estudianteD.id,
            proyectoX: proyectoX.id,
            proyectoY: proyectoY.id,
            proyectoZ: proyectoZ.id,
            ppX_2026_1: ppX_2026_1.id,
            ppX_2026_2: ppX_2026_2.id,
            ppY_2026_2: ppY_2026_2.id,
        },
    };
}

async function crearHitosPeriodo(client, periodoId, hitos) {
    const creados = [];
    for (const h of hitos) {
        const creado = await client.hitoPeriodo.create({
            data: { periodoId, orden: h.orden, nombre: h.nombre },
        });
        creados.push(creado);
    }
    return creados;
}

async function crearHitosProyecto(client, proyectoPeriodoId, hitosPeriodo) {
    const pp = await client.proyectoPeriodo.findUnique({ where: { id: proyectoPeriodoId }, include: { proyecto: true, periodo: true } });
    for (const hp of hitosPeriodo) {
        await client.hitoProyecto.create({
            data: {
                proyectoId: pp.proyectoId,
                proyectoPeriodoId: pp.id,
                hitoPeriodoId: hp.id,
                orden: hp.orden,
                nombre: hp.nombre,
                estado: "PENDIENTE",
            },
        });
    }
}

export { seedFase0C3E1 };

if (import.meta.url === `file://${process.argv[1]}`) {
    seedFase0C3E1()
        .then((result) => {
            console.log("Seed Fase 0C3E1 completado. IDs principales:", JSON.stringify(result.ids, null, 2));
        })
        .catch((e) => {
            console.error("Error en seed:", e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
