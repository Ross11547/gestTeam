export const API_BASE = "http://localhost:3000";

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
    throw new Error("No se pudo conectar con el servidor");
  }

  if (!res.ok) {
    const text = await res.text();
    console.error("API ERROR ->", path, res.status, text);

    let data = {};
    try {
      data = JSON.parse(text);
    } catch {}

    throw new Error(
      data.error ||
      data.mensaje ||
      data.message ||
      text ||
      `Error ${res.status}`
    );
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
};