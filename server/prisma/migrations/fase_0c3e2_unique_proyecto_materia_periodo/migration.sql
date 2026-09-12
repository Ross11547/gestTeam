-- Enforce one ProyectoMateria per (ProyectoPeriodo, materia)
ALTER TABLE "ProyectoMateria" ADD CONSTRAINT "ProyectoMateria_proyectoPeriodoId_materiaId_key" UNIQUE ("proyectoPeriodoId", "materiaId");
