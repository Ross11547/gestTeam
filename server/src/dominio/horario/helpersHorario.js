export { ensureIdPositivo } from "../comun/helpersComunes.js";

export const DIAS_VALIDOS = [
    "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO",
];

const BASE_DATE = "1970-01-01";

export function toHoraDate(hhmm) {
    if (typeof hhmm !== "string" || !/^\d{2}:\d{2}$/.test(hhmm)) return null;
    return new Date(`${BASE_DATE}T${hhmm}:00.000Z`);
}

export function dateToHHMM(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(11, 16); 
}
