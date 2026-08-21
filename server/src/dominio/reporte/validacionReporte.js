import { z } from "zod";

const idPositivo = z.coerce.number().int().positive();

export const TIPOS_REPORTE = ["DASHBOARD", "AVANCESEMESTRE", "TOPPROYECTOS", "PLAGIORESUMEN", "DOCENTESDESEMPENO"];

export const generarReporte = z.object({
    tipo: z.enum(TIPOS_REPORTE),
    periodoId: idPositivo.optional().nullable(),
    filtrosJson: z.record(z.unknown()).nullable().optional(),
});

export const listarReportes = z.object({
    tipo: z.enum(TIPOS_REPORTE).optional(),
    periodoId: idPositivo.optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
});
