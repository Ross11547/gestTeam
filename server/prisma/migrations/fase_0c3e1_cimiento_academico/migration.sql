-- CreateEnum
CREATE TYPE "EstadoProyectoPeriodo" AS ENUM ('ACTIVO', 'CERRADO_PERIODO');

-- AlterEnum
ALTER TYPE "EstadoProyecto" ADD VALUE 'INCONCLUSO';

-- AlterTable
ALTER TABLE "Equipo" ADD COLUMN     "proyectoMateriaId" INTEGER,
ADD COLUMN     "proyectoPeriodoId" INTEGER;

-- AlterTable
ALTER TABLE "HitoProyecto" ADD COLUMN     "hitoPeriodoId" INTEGER,
ADD COLUMN     "proyectoPeriodoId" INTEGER;

-- AlterTable
ALTER TABLE "Materia" ADD COLUMN     "esIntegrador" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Proyecto" ADD COLUMN     "proyectoOrigenId" INTEGER;

-- AlterTable
ALTER TABLE "ProyectoMateria" ADD COLUMN     "proyectoPeriodoId" INTEGER;

-- CreateTable
CREATE TABLE "ProyectoPeriodo" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "estado" "EstadoProyectoPeriodo" NOT NULL DEFAULT 'ACTIVO',
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProyectoPeriodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HitoPeriodo" (
    "id" SERIAL NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT DEFAULT '',
    "pesoSugerido" INTEGER,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HitoPeriodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluacionHito" (
    "id" SERIAL NOT NULL,
    "hitoProyectoId" INTEGER NOT NULL,
    "proyectoMateriaId" INTEGER,
    "evaluadorId" INTEGER NOT NULL,
    "tipoEvaluador" "TipoEvaluadorProyecto" NOT NULL,
    "puntaje" DOUBLE PRECISION NOT NULL,
    "comentario" TEXT DEFAULT '',
    "criteriosJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluacionHito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudContinuacionProyecto" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "solicitanteId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "claseId" INTEGER,
    "estado" "EstadoSolicitudAcceso" NOT NULL DEFAULT 'PENDIENTE',
    "motivo" TEXT DEFAULT '',
    "respuesta" TEXT DEFAULT '',
    "aprobadorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudContinuacionProyecto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProyectoPeriodo_proyectoId_idx" ON "ProyectoPeriodo"("proyectoId");

-- CreateIndex
CREATE INDEX "ProyectoPeriodo_periodoId_idx" ON "ProyectoPeriodo"("periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "ProyectoPeriodo_proyectoId_periodoId_key" ON "ProyectoPeriodo"("proyectoId", "periodoId");

-- CreateIndex
CREATE INDEX "HitoPeriodo_periodoId_idx" ON "HitoPeriodo"("periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "HitoPeriodo_periodoId_orden_key" ON "HitoPeriodo"("periodoId", "orden");

-- CreateIndex
CREATE INDEX "EvaluacionHito_hitoProyectoId_idx" ON "EvaluacionHito"("hitoProyectoId");

-- CreateIndex
CREATE INDEX "EvaluacionHito_evaluadorId_idx" ON "EvaluacionHito"("evaluadorId");

-- CreateIndex
CREATE INDEX "EvaluacionHito_proyectoMateriaId_idx" ON "EvaluacionHito"("proyectoMateriaId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluacionHito_hitoProyectoId_evaluadorId_proyectoMateriaId_key" ON "EvaluacionHito"("hitoProyectoId", "evaluadorId", "proyectoMateriaId");

-- CreateIndex
CREATE INDEX "SolicitudContinuacionProyecto_proyectoId_idx" ON "SolicitudContinuacionProyecto"("proyectoId");

-- CreateIndex
CREATE INDEX "SolicitudContinuacionProyecto_solicitanteId_idx" ON "SolicitudContinuacionProyecto"("solicitanteId");

-- CreateIndex
CREATE INDEX "SolicitudContinuacionProyecto_periodoId_idx" ON "SolicitudContinuacionProyecto"("periodoId");

-- CreateIndex
CREATE INDEX "SolicitudContinuacionProyecto_materiaId_idx" ON "SolicitudContinuacionProyecto"("materiaId");

-- CreateIndex
CREATE INDEX "SolicitudContinuacionProyecto_estado_idx" ON "SolicitudContinuacionProyecto"("estado");

-- CreateIndex
CREATE INDEX "Equipo_proyectoPeriodoId_idx" ON "Equipo"("proyectoPeriodoId");

-- CreateIndex
CREATE INDEX "Equipo_proyectoMateriaId_idx" ON "Equipo"("proyectoMateriaId");

-- CreateIndex
CREATE INDEX "HitoProyecto_proyectoPeriodoId_idx" ON "HitoProyecto"("proyectoPeriodoId");

-- CreateIndex
CREATE INDEX "HitoProyecto_hitoPeriodoId_idx" ON "HitoProyecto"("hitoPeriodoId");

-- CreateIndex
CREATE UNIQUE INDEX "HitoProyecto_proyectoPeriodoId_hitoPeriodoId_key" ON "HitoProyecto"("proyectoPeriodoId", "hitoPeriodoId");

-- CreateIndex
CREATE INDEX "Proyecto_proyectoOrigenId_idx" ON "Proyecto"("proyectoOrigenId");

-- CreateIndex
CREATE INDEX "ProyectoMateria_proyectoPeriodoId_idx" ON "ProyectoMateria"("proyectoPeriodoId");

-- AddForeignKey
ALTER TABLE "ProyectoPeriodo" ADD CONSTRAINT "ProyectoPeriodo_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProyectoPeriodo" ADD CONSTRAINT "ProyectoPeriodo_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HitoPeriodo" ADD CONSTRAINT "HitoPeriodo_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proyecto" ADD CONSTRAINT "Proyecto_proyectoOrigenId_fkey" FOREIGN KEY ("proyectoOrigenId") REFERENCES "Proyecto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProyectoMateria" ADD CONSTRAINT "ProyectoMateria_proyectoPeriodoId_fkey" FOREIGN KEY ("proyectoPeriodoId") REFERENCES "ProyectoPeriodo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_proyectoPeriodoId_fkey" FOREIGN KEY ("proyectoPeriodoId") REFERENCES "ProyectoPeriodo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_proyectoMateriaId_fkey" FOREIGN KEY ("proyectoMateriaId") REFERENCES "ProyectoMateria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HitoProyecto" ADD CONSTRAINT "HitoProyecto_proyectoPeriodoId_fkey" FOREIGN KEY ("proyectoPeriodoId") REFERENCES "ProyectoPeriodo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HitoProyecto" ADD CONSTRAINT "HitoProyecto_hitoPeriodoId_fkey" FOREIGN KEY ("hitoPeriodoId") REFERENCES "HitoPeriodo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionHito" ADD CONSTRAINT "EvaluacionHito_hitoProyectoId_fkey" FOREIGN KEY ("hitoProyectoId") REFERENCES "HitoProyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionHito" ADD CONSTRAINT "EvaluacionHito_proyectoMateriaId_fkey" FOREIGN KEY ("proyectoMateriaId") REFERENCES "ProyectoMateria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionHito" ADD CONSTRAINT "EvaluacionHito_evaluadorId_fkey" FOREIGN KEY ("evaluadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudContinuacionProyecto" ADD CONSTRAINT "SolicitudContinuacionProyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudContinuacionProyecto" ADD CONSTRAINT "SolicitudContinuacionProyecto_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudContinuacionProyecto" ADD CONSTRAINT "SolicitudContinuacionProyecto_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudContinuacionProyecto" ADD CONSTRAINT "SolicitudContinuacionProyecto_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudContinuacionProyecto" ADD CONSTRAINT "SolicitudContinuacionProyecto_claseId_fkey" FOREIGN KEY ("claseId") REFERENCES "ClaseMateria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudContinuacionProyecto" ADD CONSTRAINT "SolicitudContinuacionProyecto_aprobadorId_fkey" FOREIGN KEY ("aprobadorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

