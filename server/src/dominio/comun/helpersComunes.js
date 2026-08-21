export function ensureIdPositivo(v) {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
}

export function normalizarTexto(v) {
    return String(v || "").trim().replace(/\s+/g, " ");
}

export function crearError(message, statusCode = 400) {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.status = statusCode;
    return err;
}

// Staff = Admin o Director: pueden ver/gestionar todo el sistema.
export function esRolStaff(usuario) {
    const nombre = String(usuario?.rol?.nombre || "").trim().toLowerCase();
    return nombre === "admin" || nombre === "director";
}
