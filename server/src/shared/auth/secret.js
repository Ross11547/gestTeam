function obtenerSecretoRequerido(envName, runtimeName) {
    const value = process.env[envName];
    if (!value || value.trim().length === 0) {
        const err = new Error(`Variable de entorno ${envName} es requerida para ${runtimeName}`);
        err.status = 500;
        throw err;
    }
    return value;
}

export function obtenerSecretoJwt() {
    return obtenerSecretoRequerido("JWT_SECRET", "firmar/verificar tokens JWT");
}

export function obtenerSecretoSesion() {
    return obtenerSecretoRequerido("SESSION_SECRET", "gestión de sesiones");
}

export function obtenerSecretos() {
    return {
        jwtSecret: obtenerSecretoJwt(),
        sessionSecret: obtenerSecretoSesion(),
    };
}
