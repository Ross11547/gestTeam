export { ensureIdPositivo } from "../comun/helpersComunes.js";

export function limpiarTexto(v) {
    const t = String(v ?? "").trim().replace(/\s+/g, " ");
    return t.length ? t : null;
}

export function normalizarParalelo(v) {
    const t = limpiarTexto(v);
    return t ? t.toUpperCase() : null;
}
