// Seed determinista para Fase 0C.2V — autorización de proyectos y equipos.
// Ejecutar únicamente sobre base de datos aislada (gestteam_test).
import { config } from "dotenv";
config({ path: ".env.test", override: true });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const PASSWORD_HASH = await bcrypt.hash("TestPass123!", 10);

export async function verificarBaseAislada(client = prisma) {
    const result = await client.$queryRaw`SELECT current_database() AS db`;
    const dbName = result[0]?.db;
    if (dbName !== "gestteam_test") {
        throw new Error(`Abortado: conectado a "${dbName}" en lugar de "gestteam_test". No se ejecutará limpieza sobre BD no aislada.`);
    }
    return dbName;
}

export async function limpiar(client = prisma) {
    await verificarBaseAislada(client);
    // Orden descendente por dependencias para que CASCADE elimine registros hijo.
    const tablas = [
        "EvaluacionHito",
        "RevisionEntrega",
        "EntregaHito",
        "SolicitudContinuacionProyecto",
        "HitoProyecto",
        "EquipoMiembro",
        "Equipo",
        "ProyectoPeriodo",
        "HitoPeriodo",
        "ProyectoMateria",
        "MiembroProyecto",
        "ProyectoDestacado",
        "Proyecto",
        "InscripcionMateria",
        "DocenteMateria",
        "ClaseMateria",
        "Materia",
        "Semestre",
        "Carrera",
        "Facultad",
        "PeriodoAcademico",
        "Institucion",
        "Usuario",
        "Rol",
    ];
    for (const tabla of tablas) {
        await client.$executeRawUnsafe(`DELETE FROM "${tabla}" CASCADE;`);
    }
}

export async function seedSecurity(client = prisma) {
    await verificarBaseAislada(client);
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
        data: { nombre: "Universidad de Prueba Fase 0C2V", slug: "univ-test-0c2v", activo: true },
    });

    const facultadA = await client.facultad.create({
        data: { institucionId: institucion.id, nombre: "Facultad A" },
    });
    const facultadB = await client.facultad.create({
        data: { institucionId: institucion.id, nombre: "Facultad B" },
    });

    const carreraA = await client.carrera.create({
        data: { idFacultad: facultadA.id, nombre: "Carrera A", sigla: "CAR-A" },
    });
    const carreraB = await client.carrera.create({
        data: { idFacultad: facultadB.id, nombre: "Carrera B", sigla: "CAR-B" },
    });

    const semestreA = await client.semestre.create({
        data: { carreraId: carreraA.id, numero: 1, etiqueta: "Primer semestre A" },
    });
    const semestreB = await client.semestre.create({
        data: { carreraId: carreraB.id, numero: 1, etiqueta: "Primer semestre B" },
    });

    const materiaA = await client.materia.create({
        data: { idCarrera: carreraA.id, semestreId: semestreA.id, nombre: "Materia A", codigo: "MAT-A" },
    });
    const materiaB = await client.materia.create({
        data: { idCarrera: carreraB.id, semestreId: semestreB.id, nombre: "Materia B", codigo: "MAT-B" },
    });

    const periodo = await client.periodoAcademico.create({
        data: {
            institucionId: institucion.id,
            nombre: "2025-1",
            fechaIni: new Date("2025-01-01"),
            fechaFin: new Date("2025-12-31"),
            activo: true,
        },
    });

    const admin = await client.usuario.create({
        data: {
            nombre: "Admin", apellido: "Test", telefono: "70000001", ci: 1000001,
            correo: "admin@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolMap.Admin, activo: true, esDirector: false,
        },
    });
    const directorA = await client.usuario.create({
        data: {
            nombre: "Director", apellido: "A", telefono: "70000002", ci: 1000002,
            correo: "director.a@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolMap.Director, activo: true, esDirector: true,
            idFacultad: facultadA.id, idCarrera: carreraA.id,
        },
    });
    const directorB = await client.usuario.create({
        data: {
            nombre: "Director", apellido: "B", telefono: "70000003", ci: 1000003,
            correo: "director.b@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolMap.Director, activo: true, esDirector: true,
            idFacultad: facultadB.id, idCarrera: carreraB.id,
        },
    });
    const docenteA = await client.usuario.create({
        data: {
            nombre: "Docente", apellido: "A", telefono: "70000004", ci: 1000004,
            correo: "docente.a@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolMap.Docente, activo: true, esDirector: false,
        },
    });
    const docenteB = await client.usuario.create({
        data: {
            nombre: "Docente", apellido: "B", telefono: "70000005", ci: 1000005,
            correo: "docente.b@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolMap.Docente, activo: true, esDirector: false,
        },
    });
    const estudianteA = await client.usuario.create({
        data: {
            nombre: "Estudiante", apellido: "A", telefono: "70000006", ci: 1000006,
            correo: "estudiante.a@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolMap.Estudiante, activo: true, esDirector: false,
            idFacultad: facultadA.id, idCarrera: carreraA.id, semestreId: semestreA.id,
        },
    });
    const estudianteB = await client.usuario.create({
        data: {
            nombre: "Estudiante", apellido: "B", telefono: "70000007", ci: 1000007,
            correo: "estudiante.b@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolMap.Estudiante, activo: true, esDirector: false,
            idFacultad: facultadB.id, idCarrera: carreraB.id, semestreId: semestreB.id,
        },
    });
    const estudianteSin = await client.usuario.create({
        data: {
            nombre: "Estudiante", apellido: "Sin Proyecto", telefono: "70000008", ci: 1000008,
            correo: "estudiante.sin@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolMap.Estudiante, activo: true, esDirector: false,
            idFacultad: facultadA.id, idCarrera: carreraA.id, semestreId: semestreA.id,
        },
    });
    const estudianteExtraA = await client.usuario.create({
        data: {
            nombre: "Estudiante", apellido: "Extra A", telefono: "70000009", ci: 1000009,
            correo: "estudiante.extra.a@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolMap.Estudiante, activo: true, esDirector: false,
            idFacultad: facultadA.id, idCarrera: carreraA.id, semestreId: semestreA.id,
        },
    });
    const estudianteExtraB = await client.usuario.create({
        data: {
            nombre: "Estudiante", apellido: "Extra B", telefono: "70000010", ci: 1000010,
            correo: "estudiante.extra.b@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolMap.Estudiante, activo: true, esDirector: false,
            idFacultad: facultadB.id, idCarrera: carreraB.id, semestreId: semestreB.id,
        },
    });

    const claseA = await client.claseMateria.create({
        data: { periodoId: periodo.id, materiaId: materiaA.id, docenteId: docenteA.id, paralelo: "A" },
    });
    const claseB = await client.claseMateria.create({
        data: { periodoId: periodo.id, materiaId: materiaB.id, docenteId: docenteB.id, paralelo: "A" },
    });

    await client.docenteMateria.createMany({
        data: [
            { usuarioId: docenteA.id, materiaId: materiaA.id },
            { usuarioId: docenteB.id, materiaId: materiaB.id },
        ],
    });

    await client.inscripcionMateria.createMany({
        data: [
            { usuarioId: estudianteA.id, periodoId: periodo.id, claseId: claseA.id, materiaId: materiaA.id },
            { usuarioId: estudianteB.id, periodoId: periodo.id, claseId: claseB.id, materiaId: materiaB.id },
            { usuarioId: estudianteSin.id, periodoId: periodo.id, claseId: claseA.id, materiaId: materiaA.id },
            { usuarioId: estudianteExtraA.id, periodoId: periodo.id, claseId: claseA.id, materiaId: materiaA.id },
            { usuarioId: estudianteExtraB.id, periodoId: periodo.id, claseId: claseB.id, materiaId: materiaB.id },
        ],
    });

    const proyectoA = await client.proyecto.create({
        data: { titulo: "Proyecto A", descripcion: "Proyecto de prueba A", codigoMateria: "MAT-A", tipoGrupo: "GRUPAL", estado: "ACTIVO", creadoPorId: docenteA.id },
    });
    const proyectoB = await client.proyecto.create({
        data: { titulo: "Proyecto B", descripcion: "Proyecto de prueba B", codigoMateria: "MAT-B", tipoGrupo: "GRUPAL", estado: "ACTIVO", creadoPorId: docenteB.id },
    });

    await client.proyectoMateria.createMany({
        data: [
            { proyectoId: proyectoA.id, materiaId: materiaA.id, periodoId: periodo.id, claseId: claseA.id },
            { proyectoId: proyectoB.id, materiaId: materiaB.id, periodoId: periodo.id, claseId: claseB.id },
        ],
    });

    await client.miembroProyecto.createMany({
        data: [
            { proyectoId: proyectoA.id, usuarioId: estudianteA.id, rol: "OWNER" },
            { proyectoId: proyectoA.id, usuarioId: estudianteExtraA.id, rol: "MEMBER" },
            { proyectoId: proyectoA.id, usuarioId: docenteA.id, rol: "DOCENTE" },
            { proyectoId: proyectoB.id, usuarioId: estudianteB.id, rol: "OWNER" },
            { proyectoId: proyectoB.id, usuarioId: estudianteExtraB.id, rol: "MEMBER" },
            { proyectoId: proyectoB.id, usuarioId: docenteB.id, rol: "DOCENTE" },
        ],
    });

    const equipoA = await client.equipo.create({
        data: { proyectoId: proyectoA.id, nombre: "Equipo A", tipoGrupo: "GRUPAL", materiaId: materiaA.id, periodoId: periodo.id, claseId: claseA.id, creadoPorId: estudianteA.id },
    });
    const equipoB = await client.equipo.create({
        data: { proyectoId: proyectoB.id, nombre: "Equipo B", tipoGrupo: "GRUPAL", materiaId: materiaB.id, periodoId: periodo.id, claseId: claseB.id, creadoPorId: estudianteB.id },
    });

    await client.equipoMiembro.createMany({
        data: [
            { equipoId: equipoA.id, usuarioId: estudianteA.id, rolEquipo: "MIEMBRO", activo: true },
            { equipoId: equipoA.id, usuarioId: estudianteExtraA.id, rolEquipo: "MIEMBRO", activo: true },
            { equipoId: equipoB.id, usuarioId: estudianteB.id, rolEquipo: "MIEMBRO", activo: true },
            { equipoId: equipoB.id, usuarioId: estudianteExtraB.id, rolEquipo: "MIEMBRO", activo: true },
        ],
    });

    return {
        ids: {
            institucion: institucion.id,
            facultadA: facultadA.id,
            facultadB: facultadB.id,
            carreraA: carreraA.id,
            carreraB: carreraB.id,
            materiaA: materiaA.id,
            materiaB: materiaB.id,
            periodo: periodo.id,
            claseA: claseA.id,
            claseB: claseB.id,
            proyectoA: proyectoA.id,
            proyectoB: proyectoB.id,
            equipoA: equipoA.id,
            equipoB: equipoB.id,
            admin: admin.id,
            directorA: directorA.id,
            directorB: directorB.id,
            docenteA: docenteA.id,
            docenteB: docenteB.id,
            estudianteA: estudianteA.id,
            estudianteB: estudianteB.id,
            estudianteSin: estudianteSin.id,
            estudianteExtraA: estudianteExtraA.id,
            estudianteExtraB: estudianteExtraB.id,
        },
    };
}

// Si se ejecuta directamente, corre el seed y termina.
if (import.meta.url === `file://${process.argv[1]}`) {
    seedSecurity()
        .then((result) => {
            console.log("Seed de seguridad completado. IDs:", JSON.stringify(result.ids, null, 2));
        })
        .catch((e) => {
            console.error("Error en seed:", e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
