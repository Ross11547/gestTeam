-- Add check constraint to enforce HitoPeriodo.orden in 1..5
ALTER TABLE "HitoPeriodo" ADD CONSTRAINT "HitoPeriodo_orden_check" CHECK ("orden" BETWEEN 1 AND 5);
