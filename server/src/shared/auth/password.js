import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashearContrasena(plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function compararContrasena(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
}

export function esHashBcrypt(value) {
    return typeof value === "string" && value.startsWith("$2");
}

export function validarContrasenaPlana(password) {
    if (typeof password !== "string" || password.trim().length === 0) {
        const err = new Error("La contraseña es requerida");
        err.status = 400;
        throw err;
    }
    if (password.length < 10) {
        const err = new Error("La contraseña debe tener al menos 10 caracteres");
        err.status = 400;
        throw err;
    }
}
