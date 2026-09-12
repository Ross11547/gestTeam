ALTER TABLE "SolicitudAccesoProyecto"
ADD COLUMN "proyectoMateriaId" INTEGER,
ADD COLUMN "resueltoEn" TIMESTAMP(3);

CREATE TABLE "DocumentoSolicitudAcceso" (
    "id" SERIAL NOT NULL,
    "solicitudId" INTEGER NOT NULL,
    "documentoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoSolicitudAcceso_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SolicitudAccesoProyecto_proyectoMateriaId_idx"
ON "SolicitudAccesoProyecto"("proyectoMateriaId");

CREATE UNIQUE INDEX "SolicitudAccesoProyecto_pendiente_contexto_key"
ON "SolicitudAccesoProyecto"("solicitanteId", "proyectoMateriaId")
WHERE "estado" = 'PENDIENTE' AND "proyectoMateriaId" IS NOT NULL;

CREATE UNIQUE INDEX "DocumentoSolicitudAcceso_solicitudId_documentoId_key"
ON "DocumentoSolicitudAcceso"("solicitudId", "documentoId");

CREATE INDEX "DocumentoSolicitudAcceso_documentoId_idx"
ON "DocumentoSolicitudAcceso"("documentoId");

ALTER TABLE "SolicitudAccesoProyecto"
ADD CONSTRAINT "SolicitudAccesoProyecto_proyectoMateriaId_fkey"
FOREIGN KEY ("proyectoMateriaId") REFERENCES "ProyectoMateria"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DocumentoSolicitudAcceso"
ADD CONSTRAINT "DocumentoSolicitudAcceso_solicitudId_fkey"
FOREIGN KEY ("solicitudId") REFERENCES "SolicitudAccesoProyecto"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentoSolicitudAcceso"
ADD CONSTRAINT "DocumentoSolicitudAcceso_documentoId_fkey"
FOREIGN KEY ("documentoId") REFERENCES "Documento"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
