export const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

function getSessionToken() {
  return (
    localStorage.getItem("gt_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

function saveSessionToken(token) {
  if (!token) return;

  localStorage.setItem("gt_token", token);
  localStorage.setItem("token", token);
}

function clearSessionToken() {
  localStorage.removeItem("gt_token");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
}

export async function authFetch(input, init = {}) {
  const token = getSessionToken();
  const headers = new Headers(init.headers || {});

  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}

async function request(path, { method = "GET", body, headers } = {}) {
  const token = getSessionToken();

  let res;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    console.error("API ERROR ->", path, e);
    throw new Error("No se pudo conectar con el servidor");
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearSessionToken();
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("gestteam:sesion-invalida"));
    }
    const text = await res.text();
    console.error("API ERROR ->", path, res.status, text);

    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      console.error("No se pudo parsear la respuesta del servidor");
    }

    const error = new Error(
      data.error ||
      data.mensaje ||
      data.message ||
      text ||
      `Error ${res.status}`
    );
    error.status = res.status;
    error.data = data;
    throw error;
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (data?.token) {
    saveSessionToken(data.token);
  }

  if (data?.data?.token) {
    saveSessionToken(data.data.token);
  }

  return data;
}

export const api = {
  login: (payload) => request("/api/login", { method: "POST", body: payload }),

  logout: () => {
    clearSessionToken();
    return request("/auth/logout", { method: "POST" });
  },

  myProjects: () => request("/projects/my"),

  addMember: (projectId, data) =>
    request(`/projects/${projectId}/members`, {
      method: "POST",
      body: data,
    }),

  createProject: (payload) =>
    request("/projects", {
      method: "POST",
      body: payload,
    }),

  overview: () => request("/github/me/overview"),

  repos: () => request("/github/me/repos"),

  createRepo: (projectId) =>
    request(`/github/project/${projectId}/repo`, {
      method: "POST",
    }),

  importRepos: () =>
    request("/github/import/repos", {
      method: "POST",
    }),

  invitePersonalOnAll: () =>
    request("/github/me/invite-personal-on-all", {
      method: "POST",
    }),

  retryInvites: () =>
    request("/github/me/retry-invites", {
      method: "POST",
    }),

  linkGithub: (type) => {
    const t = getSessionToken();

    if (!t) {
      alert("No hay sesión activa. Inicia sesión nuevamente.");
      clearSessionToken();
      window.location.href = "/login";
      return;
    }

    window.location.href =
      `${API_BASE}/github/oauth/start` +
      `?type=${encodeURIComponent(type)}` +
      `&t=${encodeURIComponent(t)}`;
  },

  installApp: () => {
    const t = getSessionToken();

    if (!t) {
      alert("No hay sesión activa. Inicia sesión nuevamente.");
      clearSessionToken();
      window.location.href = "/login";
      return;
    }

    window.location.href =
      `${API_BASE}/github/app/install?t=${encodeURIComponent(t)}`;
  },

  myMaterias: () => request("/api/materias/mias"),

  listarProyectosPeriodo: (filtros = {}) =>
    request(`/api/proyectoPeriodo${crearConsulta(filtros)}`),

  obtenerProyectoPeriodo: (id) => request(`/api/proyectoPeriodo/${id}`),

  listarProyectosMateria: (proyectoPeriodoId) =>
    request(`/api/proyectoMateria${crearConsulta({ proyectoPeriodoId })}`),

  obtenerProyectoMateria: (id) => request(`/api/proyectoMateria/${id}`),

  listarHitosProyecto: (proyectoPeriodoId) =>
    request(`/api/hitoProyecto${crearConsulta({ proyectoPeriodoId })}`),

  obtenerHitoProyecto: (id) => request(`/api/hitoProyecto/${id}`),

  listarEquipos: (filtros = {}) =>
    request(`/api/equipo${crearConsulta(filtros)}`),

  obtenerEquipo: (id) => request(`/api/equipo/${id}`),

  listarMiembrosEquipo: (id) => request(`/api/equipo/${id}/miembro`),

  listarCatalogoProyectos: (filtros = {}) =>
    request(`/api/proyecto/catalogo${crearConsulta(filtros)}`),

  obtenerCatalogoProyecto: (id) => request(`/api/proyecto/catalogo/${id}`),

  listarDocumentosSolicitables: (proyectoId) =>
    request(`/api/proyecto/catalogo/${proyectoId}/documentos-solicitables`),

  crearSolicitudAcceso: (payload) =>
    request("/api/solicitud-acceso", { method: "POST", body: payload }),

  listarFacultades: () => request("/api/facultad"),

  listarCarreras: (filtros = {}) =>
    request(`/api/carrera${crearConsulta(filtros)}`),

  listarMateriasPorCarrera: (idCarrera) =>
    request(`/api/materia/by-carrera?idCarrera=${idCarrera}`),

  listarPeriodosAcademicos: () => request("/api/periodoAcademico"),
};

function crearConsulta(filtros) {
  const parametros = new URLSearchParams();

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") {
      parametros.set(clave, String(valor));
    }
  });

  const consulta = parametros.toString();
  return consulta ? `?${consulta}` : "";
}
