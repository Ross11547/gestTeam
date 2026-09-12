import { config } from "dotenv";
config({ path: ".env.test", override: true });

import assert from "node:assert";
import { PrismaClient } from "@prisma/client";
import { seedFase0C3E1 } from "../prisma/seed.fase0c3e1.js";
import { crearPeriodoAcademicoCasoUso } from "../src/application/casosUso/periodoAcademico/crearPeriosoAdemico.js";
import { crearProyectoPeriodoCasoUso } from "../src/application/casosUso/proyectoPeriodo/crearProyectoPeriodo.js";
import { cerrarProyectoPeriodoCasoUso } from "../src/application/casosUso/proyectoPeriodo/cerrarProyectoPeriodo.js";
import { vincularProyectoMateriaCasoUso } from "../src/application/casosUso/proyectoMateria/vincularProyectoMateria.js";
import { crearEvaluacionHitoCasoUso } from "../src/application/casosUso/evaluacionHito/crearEvaluacionHito.js";
import { crearEquipoCasoUso } from "../src/application/casosUso/equipo/crearEquipo.js";
import { actualizarEquipoCasoUso } from "../src/application/casosUso/equipo/actualizarEquipo.js";
import { crearEntregaCasoUso } from "../src/application/casosUso/entrega/crearEntrega.js";
import { crearSolicitudContinuacionProyectoCasoUso } from "../src/application/casosUso/solicitudContinuacion/crearSolicitudContinuacionProyecto.js";
import { crearHitoProyectoCasoUso } from "../src/application/casosUso/hitoProyecto/crearHitoProyecto.js";

const prisma = new PrismaClient();

let pasados = 0;
let fallos = 0;

async function run(nombre, fn) {
    try {
        await fn();
        pasados++;
        console.log(`  ✓ ${nombre}`);
    } catch (e) {
        fallos++;
        console.error(`  ✗ ${nombre}`);
        console.error(`    ${e.message}`);
    }
}

async function assertRechaza(fn, fraseEsperada) {
    try {
        await fn();
        throw new Error(`Se esperaba error con "${fraseEsperada}" pero no se lanzó`);
    } catch (e) {
        if (!e.message.toLowerCase().includes(fraseEsperada.toLowerCase())) {
            throw new Error(`Error inesperado: ${e.message}`);
        }
    }
}

async function main() {
    console.log("=== Seed de fixtures ===");
    await seedFase0C3E1();

    const ids = await cargarIds();
    const admin = { id: ids.admin, rol: { nombre: "Admin" } };
    const director = { id: ids.director, idCarrera: ids.carreraSistemas, rol: { nombre: "Director" } };
    const docenteIntegradorUsuario = { id: ids.docenteIntegrador, rol: { nombre: "Docente" } };

    console.log("\n=== Tests Fase 0C.3E-2 ===");

    await run("A. Crear periodo crea exactamente H1-H5", async () => {
        const periodo = await crearPeriodoAcademicoCasoUso({
            institucionId: ids.institucion,
            nombre: "2027-1",
            fechaIni: "2027-01-01T00:00:00Z",
            fechaFin: "2027-06-30T00:00:00Z",
        });
        const hitos = await prisma.hitoPeriodo.findMany({ where: { periodoId: periodo.id }, orderBy: { orden: "asc" } });
        assert.strictEqual(hitos.length, 5, `Esperado 5, obtenido ${hitos.length}`);
        assert.deepStrictEqual(hitos.map((h) => h.orden), [1, 2, 3, 4, 5]);
        ids.periodo2027_1 = periodo.id;
    });

    await run("B. Crear HitoPeriodo orden 6 es rechazado", async () => {
        await assertRechaza(
            () =>
                prisma.hitoPeriodo.create({
                    data: { periodoId: ids.periodo2027_1, orden: 6, nombre: "H6 inválido" },
                }),
            "restricción"
        );
    });

    await run("B2. Crear HitoPeriodo orden 0 es rechazado", async () => {
        await assertRechaza(
            () =>
                prisma.hitoPeriodo.create({
                    data: { periodoId: ids.periodo2027_1, orden: 0, nombre: "H0 inválido" },
                }),
            "restricción"
        );
    });

    await run("C. Duplicar H3 del periodo es rechazado", async () => {
        await assertRechaza(
            () =>
                prisma.hitoPeriodo.create({
                    data: { periodoId: ids.periodo2027_1, orden: 3, nombre: "Otro H3" },
                }),
            "Unique constraint"
        );
    });

    await run("D. Crear ProyectoPeriodo crea exactamente 5 HitoProyecto", async () => {
        const proyectoNuevo = await prisma.proyecto.create({
            data: { titulo: "Proyecto Nuevo", descripcion: "Nuevo", tipoGrupo: "GRUPAL", estado: "ACTIVO", creadoPorId: ids.estudianteA },
        });
        const pp = await crearProyectoPeriodoCasoUso({
            proyectoId: proyectoNuevo.id,
            periodoId: ids.periodo2027_1,
        });
        assert.strictEqual(pp.hitos.length, 5);
        assert.deepStrictEqual(pp.hitos.map((h) => h.hitoPeriodo.orden), [1, 2, 3, 4, 5]);
        assert.strictEqual(pp.hitos.every((h) => h.proyectoPeriodoId === pp.id), true);
        assert.strictEqual(pp.hitos.every((h) => h.proyectoId === proyectoNuevo.id), true);
        ids.proyectoNuevo = proyectoNuevo.id;
        ids.ppNuevo = pp.id;
    });

    await run("E. Duplicar ProyectoPeriodo es rechazado", async () => {
        await assertRechaza(
            () =>
                crearProyectoPeriodoCasoUso({
                    proyectoId: ids.proyectoNuevo,
                    periodoId: ids.periodo2027_1,
                }),
            "Ya existe un ProyectoPeriodo"
        );
    });

    await run("F. HitoProyecto con HitoPeriodo de otro periodo es rechazado", async () => {
        const hitoOtroPeriodo = await prisma.hitoPeriodo.findFirst({
            where: { periodoId: ids.periodo2026_1, orden: 1 },
        });
        await assertRechaza(
            () =>
                crearHitoProyectoCasoUso({
                    proyectoPeriodoId: ids.ppNuevo,
                    hitoPeriodoId: hitoOtroPeriodo.id,
                }),
            "no pertenece al periodo"
        );
    });

    await run("G. ProyectoMateria con ProyectoPeriodo de otro proyecto es rechazado", async () => {
        const ppOtro = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: ids.proyectoY } });
        await assertRechaza(
            () =>
                prisma.proyectoMateria.create({
                    data: {
                        proyectoId: ids.proyectoNuevo,
                        periodoId: ppOtro.periodoId,
                        materiaId: ids.materiaIntegrador1,
                        proyectoPeriodoId: ppOtro.id,
                    },
                }),
            "proyectoId no coincide"
        );
    });

    await run("H. ProyectoMateria con clase de otro periodo es rechazado", async () => {
        const claseOtroPeriodo = await prisma.claseMateria.findFirst({ where: { periodoId: ids.periodo2026_1 } });
        await assertRechaza(
            () =>
                vincularProyectoMateriaCasoUso({
                    proyectoPeriodoId: ids.ppNuevo,
                    materiaId: claseOtroPeriodo.materiaId,
                    claseId: claseOtroPeriodo.id,
                }),
            "La clase no corresponde al periodo"
        );
    });

    await run("H2. ProyectoMateria con materia de clase distinta es rechazado", async () => {
        const claseIntegrador2 = await prisma.claseMateria.findFirst({ where: { periodoId: ids.periodo2026_2, materiaId: ids.materiaIntegrador2 } });
        await assertRechaza(
            () =>
                vincularProyectoMateriaCasoUso({
                    proyectoPeriodoId: ids.ppNuevo,
                    materiaId: ids.materiaIntegrador1,
                    claseId: claseIntegrador2.id,
                }),
            "La clase no corresponde a la materia"
        );
    });

    let equipoNuevoId = null;
    let pmNuevoId = null;

    await run("I. Equipo con ProyectoPeriodo de otro proyecto es rechazado", async () => {
        const ppOtro = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: ids.proyectoY } });
        await assertRechaza(
            () =>
                crearEquipoCasoUso(
                    {
                        proyectoId: ids.proyectoNuevo,
                        nombre: "Equipo inválido",
                        proyectoPeriodoId: ppOtro.id,
                    },
                    admin
                ),
            "no corresponde al proyecto"
        );
    });

    await run("I0. Crear equipo válido para proyecto nuevo", async () => {
        const clase2027_1 = await prisma.claseMateria.findFirst({ where: { periodoId: ids.periodo2027_1, materiaId: ids.materiaIntegrador1 } });
        const pmNuevo = await vincularProyectoMateriaCasoUso({
            proyectoPeriodoId: ids.ppNuevo,
            materiaId: ids.materiaIntegrador1,
            claseId: clase2027_1?.id,
        });
        pmNuevoId = pmNuevo.id;
        const equipo = await crearEquipoCasoUso(
            {
                proyectoId: ids.proyectoNuevo,
                nombre: "Equipo Nuevo Válido",
                proyectoPeriodoId: ids.ppNuevo,
                proyectoMateriaId: pmNuevo.id,
            },
            admin
        );
        equipoNuevoId = equipo.id;
        assert.strictEqual(equipo.proyectoPeriodoId, ids.ppNuevo);
        assert.strictEqual(equipo.proyectoMateriaId, pmNuevo.id);
    });

    await run("I2. Equipo con ProyectoMateria de otro periodo es rechazado", async () => {
        const pmOtroPeriodo = await prisma.proyectoMateria.findFirst({
            where: { proyectoId: ids.proyectoNuevo, periodoId: ids.periodo2026_2 },
        });
        if (!pmOtroPeriodo) {
            const pp2026_2_nuevo = await crearProyectoPeriodoCasoUso({
                proyectoId: ids.proyectoNuevo,
                periodoId: ids.periodo2026_2,
            });
            const claseIntegrador2 = await prisma.claseMateria.findFirst({ where: { periodoId: ids.periodo2026_2, materiaId: ids.materiaIntegrador2 } });
            await vincularProyectoMateriaCasoUso({
                proyectoPeriodoId: pp2026_2_nuevo.id,
                materiaId: ids.materiaIntegrador2,
                claseId: claseIntegrador2.id,
            });
        }
        const pmOtro = await prisma.proyectoMateria.findFirst({
            where: { proyectoId: ids.proyectoNuevo, periodoId: ids.periodo2026_2 },
        });
        await assertRechaza(
            () =>
                crearEquipoCasoUso(
                    {
                        proyectoId: ids.proyectoNuevo,
                        nombre: "Equipo inválido 2",
                        proyectoPeriodoId: ids.ppNuevo,
                        proyectoMateriaId: pmOtro.id,
                    },
                    admin
                ),
            "no corresponde al ProyectoPeriodo"
        );
    });

    await run("I3. Actualizar Equipo a ProyectoMateria incompatible es rechazado", async () => {
        const pmOtro = await prisma.proyectoMateria.findFirst({ where: { proyectoId: ids.proyectoX, periodoId: ids.periodo2026_1 } });
        await assertRechaza(
            () =>
                actualizarEquipoCasoUso(
                    equipoNuevoId,
                    { proyectoMateriaId: pmOtro.id },
                    admin
                ),
            "no corresponde al proyecto"
        );
    });

    await run("J. Entrega de equipo 2026-1 sobre hito 2026-2 es rechazada", async () => {
        const equipo2026_1 = await prisma.equipo.findFirst({
            where: { proyectoId: ids.proyectoX, periodoId: ids.periodo2026_1 },
        });
        const hito2026_2 = await prisma.hitoProyecto.findFirst({
            where: { proyectoId: ids.proyectoX, proyectoPeriodo: { periodoId: ids.periodo2026_2 }, hitoPeriodo: { orden: 1 } },
            include: { proyectoPeriodo: true },
        });
        await assertRechaza(
            () =>
                crearEntregaCasoUso(
                    { hitoId: hito2026_2.id, equipoId: equipo2026_1.id },
                    admin
                ),
            "mismo periodo operativo"
        );
    });

    await run("K. EvaluacionHito con ProyectoMateria de otro Proyecto es rechazada", async () => {
        const hitoX = await prisma.hitoProyecto.findFirst({
            where: { proyectoId: ids.proyectoX, proyectoPeriodo: { periodoId: ids.periodo2026_2 }, hitoPeriodo: { orden: 1 } },
        });
        const pmY = await prisma.proyectoMateria.findFirst({ where: { proyectoId: ids.proyectoY } });
        await assertRechaza(
            () =>
                crearEvaluacionHitoCasoUso({
                    hitoProyectoId: hitoX.id,
                    proyectoMateriaId: pmY.id,
                    evaluadorId: ids.docenteIntegrador,
                    tipoEvaluador: "DOCENTE",
                    puntaje: 80,
                }, docenteIntegradorUsuario),
            "mismo Proyecto"
        );
    });

    await run("L. EvaluacionHito con ProyectoMateria de otro periodo es rechazada", async () => {
        const hitoX_2026_2 = await prisma.hitoProyecto.findFirst({
            where: { proyectoId: ids.proyectoX, proyectoPeriodo: { periodoId: ids.periodo2026_2 }, hitoPeriodo: { orden: 1 } },
        });
        const pmX_2026_1 = await prisma.proyectoMateria.findFirst({ where: { proyectoId: ids.proyectoX, periodoId: ids.periodo2026_1 } });
        await assertRechaza(
            () =>
                crearEvaluacionHitoCasoUso({
                    hitoProyectoId: hitoX_2026_2.id,
                    proyectoMateriaId: pmX_2026_1.id,
                    evaluadorId: ids.docenteIntegrador,
                    tipoEvaluador: "DOCENTE",
                    puntaje: 80,
                }, docenteIntegradorUsuario),
            "mismo ProyectoPeriodo"
        );
    });

    await run("M. Proyecto 2026-1 tiene exactamente 5 hitos", async () => {
        const pp = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: ids.proyectoX, periodoId: ids.periodo2026_1 } });
        const count = await prisma.hitoProyecto.count({ where: { proyectoPeriodoId: pp.id } });
        assert.strictEqual(count, 5);
    });

    await run("N. Mismo Proyecto 2026-2 tiene otros 5 hitos", async () => {
        const pp = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: ids.proyectoX, periodoId: ids.periodo2026_2 } });
        const count = await prisma.hitoProyecto.count({ where: { proyectoPeriodoId: pp.id } });
        assert.strictEqual(count, 5);
    });

    await run("O. Historial 2026-1 permanece intacto después de cerrar otro periodo", async () => {
        const pp2026_1 = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: ids.proyectoX, periodoId: ids.periodo2026_1 } });
        const hitos2026_1_antes = await prisma.hitoProyecto.count({ where: { proyectoPeriodoId: pp2026_1.id } });
        const proyectoO = await prisma.proyecto.create({
            data: { titulo: "Proyecto O", descripcion: "O", tipoGrupo: "GRUPAL", estado: "ACTIVO", creadoPorId: ids.estudianteA },
        });
        const ppO = await crearProyectoPeriodoCasoUso({ proyectoId: proyectoO.id, periodoId: ids.periodo2027_1 });
        await vincularProyectoMateriaCasoUso({ proyectoPeriodoId: ppO.id, materiaId: ids.materiaIntegrador2 });
        await cerrarProyectoPeriodoCasoUso({ proyectoPeriodoId: ppO.id }, director);
        const hitos2026_1_despues = await prisma.hitoProyecto.count({ where: { proyectoPeriodoId: pp2026_1.id } });
        assert.strictEqual(hitos2026_1_antes, hitos2026_1_despues);
    });

    await run("P. Continuidad con materia diferente es permitida", async () => {
        const pp = await crearProyectoPeriodoCasoUso({
            proyectoId: ids.proyectoZ,
            periodoId: ids.periodo2026_2,
        });
        const clasePsicologia = await prisma.claseMateria.findFirst({ where: { periodoId: ids.periodo2026_2, materiaId: ids.materiaPsicologia } });
        const pm = await vincularProyectoMateriaCasoUso({
            proyectoPeriodoId: pp.id,
            materiaId: ids.materiaPsicologia,
            claseId: clasePsicologia.id,
        });
        assert.strictEqual(pm.proyectoPeriodo.periodo.id, ids.periodo2026_2);
        assert.strictEqual(pm.materia.id, ids.materiaPsicologia);
    });

    await run("Q. Proyecto colaborativo mantiene contextos separados", async () => {
        const ppY = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: ids.proyectoY, periodoId: ids.periodo2026_2 } });
        const equipos = await prisma.equipo.findMany({ where: { proyectoPeriodoId: ppY.id }, include: { proyectoMateria: { include: { materia: true } } } });
        assert.strictEqual(equipos.length, 2);
        const materias = equipos.map((e) => e.proyectoMateria.materia.nombre).sort();
        assert.deepStrictEqual(materias, ["Proyecto Integrador II", "Psicología Aplicada"]);
    });

    await run("R. Cerrar ProyectoPeriodo deja Proyecto ACTIVO", async () => {
        const pp = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: ids.proyectoY, periodoId: ids.periodo2026_2 } });
        const hitoFinal = await prisma.hitoProyecto.findFirst({ where: { proyectoPeriodoId: pp.id, hitoPeriodo: { orden: 5 } } });
        const contextos = await prisma.proyectoMateria.findMany({ where: { proyectoPeriodoId: pp.id }, include: { clase: true } });
        for (const contexto of contextos) {
            await prisma.evaluacionHito.create({
                data: {
                    hitoProyectoId: hitoFinal.id,
                    proyectoMateriaId: contexto.id,
                    evaluadorId: contexto.clase.docenteId,
                    tipoEvaluador: "DOCENTE",
                    puntaje: 0,
                },
            });
        }
        const cerrado = await cerrarProyectoPeriodoCasoUso({ proyectoPeriodoId: pp.id }, director);
        assert.strictEqual(cerrado.estado, "CERRADO_PERIODO");
        const proyecto = await prisma.proyecto.findUnique({ where: { id: ids.proyectoY } });
        assert.strictEqual(proyecto.estado, "ACTIVO");
    });

    await run("S. Cerrar ProyectoPeriodo no modifica datos históricos", async () => {
        const pp = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: ids.proyectoX, periodoId: ids.periodo2026_2 } });
        const hitosAntes = await prisma.hitoProyecto.count({ where: { proyectoPeriodoId: pp.id } });
        const equiposAntes = await prisma.equipo.count({ where: { proyectoPeriodoId: pp.id } });
        await cerrarProyectoPeriodoCasoUso({ proyectoPeriodoId: pp.id }, director);
        const hitosDespues = await prisma.hitoProyecto.count({ where: { proyectoPeriodoId: pp.id } });
        const equiposDespues = await prisma.equipo.count({ where: { proyectoPeriodoId: pp.id } });
        assert.strictEqual(hitosAntes, hitosDespues);
        assert.strictEqual(equiposAntes, equiposDespues);
    });

    await run("T. Proyecto puede quedar INCONCLUSO sin indexación", async () => {
        const proyecto = await prisma.proyecto.update({
            where: { id: ids.proyectoNuevo },
            data: { estado: "INCONCLUSO" },
        });
        assert.strictEqual(proyecto.estado, "INCONCLUSO");
    });

    await run("U. SolicitudContinuacionProyecto valida existencia y coherencia", async () => {
        const estudianteAUsuario = { id: ids.estudianteA, rol: { nombre: "Estudiante" } };
        const solicitud = await crearSolicitudContinuacionProyectoCasoUso({
            proyectoId: ids.proyectoZ,
            periodoId: ids.periodo2026_2,
            materiaId: ids.materiaIntegrador2,
            motivo: "Continuación de prueba",
        }, estudianteAUsuario);
        assert.strictEqual(solicitud.estado, "PENDIENTE");
    });

    console.log(`\n=== Resultados: ${pasados} pasados, ${fallos} fallos ===`);
    await prisma.$disconnect();
    process.exit(fallos > 0 ? 1 : 0);
}

async function cargarIds() {
    const institucion = await prisma.institucion.findFirst({ where: { slug: "univ-test-0c3e1" } });
    const periodo2026_1 = await prisma.periodoAcademico.findFirst({ where: { nombre: "2026-1" } });
    const periodo2026_2 = await prisma.periodoAcademico.findFirst({ where: { nombre: "2026-2" } });
    const materiaIntegrador1 = await prisma.materia.findFirst({ where: { codigo: "PI1" } });
    const materiaIntegrador2 = await prisma.materia.findFirst({ where: { codigo: "PI2" } });
    const materiaPsicologia = await prisma.materia.findFirst({ where: { codigo: "PSI" } });
    const admin = await prisma.usuario.findFirst({ where: { correo: "admin.0c3e1@unifranz.edu.bo" } });
    const director = await prisma.usuario.findFirst({ where: { correo: "director.sistemas.0c3e1@unifranz.edu.bo" } });
    const docenteIntegrador = await prisma.usuario.findFirst({ where: { correo: "docente.integrador.0c3e1@unifranz.edu.bo" } });
    const estudianteA = await prisma.usuario.findFirst({ where: { correo: "estudiante.a.0c3e1@unifranz.edu.bo" } });
    const proyectoX = await prisma.proyecto.findFirst({ where: { titulo: "Proyecto X - Continuidad" } });
    const proyectoY = await prisma.proyecto.findFirst({ where: { titulo: "Proyecto Y - Colaborativo" } });
    const proyectoZ = await prisma.proyecto.findFirst({ where: { titulo: "Proyecto Z - Inconcluso" } });

    return {
        institucion: institucion.id,
        periodo2026_1: periodo2026_1.id,
        periodo2026_2: periodo2026_2.id,
        materiaIntegrador1: materiaIntegrador1.id,
        materiaIntegrador2: materiaIntegrador2.id,
        materiaPsicologia: materiaPsicologia.id,
        admin: admin.id,
        director: director.id,
        carreraSistemas: director.idCarrera,
        docenteIntegrador: docenteIntegrador.id,
        estudianteA: estudianteA.id,
        proyectoX: proyectoX.id,
        proyectoY: proyectoY.id,
        proyectoZ: proyectoZ.id,
    };
}

main().catch(async (e) => {
    console.error("Error fatal:", e);
    await prisma.$disconnect();
    process.exit(1);
});
