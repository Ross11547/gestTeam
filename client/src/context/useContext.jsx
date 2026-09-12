import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../enums/routes/Routes";
import { toast } from "sonner";

const UserContext = createContext(null);

const ColorsEstu = {
  primary: "#fcbf49",
  primary100: "#FFDE59",
  primary200: "#FFE680",
  primary300: "#FFD700",
  primary400: "#E6B800",
  primary500: "#CC9A00",
  primary600: "#B38600",
  primary700: "#996F00",
  primary800: "#F8E061",
  primary900: "#ffc107",
};

const ColorsAdmin = {
  primary: "#F89C5E",
  primary100: "#FFE1CC",
  primary200: "#FFC299",
  primary300: "#FFA366",
  primary400: "#F89C5E",
  primary500: "#F06724",
  primary600: "#E95A0C",
  primary700: "#CC4F0B",
  primary800: "#A84308",
  primary900: "#7A3106",
};

const isString = (value) => typeof value === "string" && value.trim() !== "";

const normalizeText = (value) => {
  if (!value) return "";
  return String(value).trim().toLowerCase();
};

const getRoleName = (user) => {
  if (!user) return "";

  if (isString(user.rol)) return normalizeText(user.rol);
  if (isString(user.rol?.nombre)) return normalizeText(user.rol.nombre);
  if (isString(user.Rol?.nombre)) return normalizeText(user.Rol.nombre);
  if (isString(user.role)) return normalizeText(user.role);
  if (isString(user.role?.nombre)) return normalizeText(user.role.nombre);

  return "";
};

const isAdminUser = (user) => {
  const roleName = getRoleName(user);

  return (
    roleName === "admin" ||
    roleName === "administrador" ||
    roleName === "administradora" ||
    Number(user?.idRol) === 1
  );
};

const isValidTheme = (theme) => {
  if (!theme || typeof theme !== "object") return false;

  return Boolean(
    theme.primary ||
      theme.primary100 ||
      theme.primary200 ||
      theme.primary300 ||
      theme.primary400 ||
      theme.primary500 ||
      theme.primary600 ||
      theme.primary700 ||
      theme.primary800 ||
      theme.primary900
  );
};

const normalizeTheme = (theme, fallback) => ({
  primary: theme?.primary || fallback.primary,
  primary100: theme?.primary100 || fallback.primary100,
  primary200: theme?.primary200 || fallback.primary200,
  primary300: theme?.primary300 || fallback.primary300,
  primary400: theme?.primary400 || fallback.primary400,
  primary500: theme?.primary500 || fallback.primary500,
  primary600: theme?.primary600 || fallback.primary600,
  primary700: theme?.primary700 || fallback.primary700,
  primary800: theme?.primary800 || fallback.primary800,
  primary900: theme?.primary900 || fallback.primary900,
});

const getFacultyTheme = (user) => {
  return (
    user?.facultad?.theme ||
    user?.carrera?.facultad?.theme ||
    user?.carrera?.theme ||
    null
  );
};

const resolveTheme = (user) => {
  if (!user) return ColorsEstu;

  if (isAdminUser(user)) {
    return ColorsAdmin;
  }

  const facultyTheme = getFacultyTheme(user);

  if (isValidTheme(facultyTheme)) {
    return normalizeTheme(facultyTheme, ColorsEstu);
  }

  return ColorsEstu;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(ColorsEstu);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setUser(null);
      setTheme(ColorsEstu);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setTheme(resolveTheme(parsedUser));
    } catch (error) {
      console.error("Error al leer el usuario desde localStorage:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("gt_token");
      setUser(null);
      setTheme(ColorsEstu);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setTheme(ColorsEstu);
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));
    setTheme(resolveTheme(user));
  }, [user]);

  useEffect(() => {
    const manejarSesionInvalida = () => {
      setUser(null);
      setTheme(ColorsEstu);
      navigate(ROUTES.LOGIN);
      toast.error("Tu sesión expiró. Inicia sesión nuevamente.");
    };

    window.addEventListener("gestteam:sesion-invalida", manejarSesionInvalida);
    return () => window.removeEventListener("gestteam:sesion-invalida", manejarSesionInvalida);
  }, [navigate]);

  const login = (userData) => {
    setUser(userData);
    setTheme(resolveTheme(userData));
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setTheme(ColorsEstu);
    localStorage.removeItem("user");
    localStorage.removeItem("gt_token");

    navigate(ROUTES.LOGIN);
    toast.success("Cierre de sesión");
  };

  return (
    <UserContext.Provider value={{ user, login, logout, theme }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser debe usarse dentro de UserProvider");
  }

  return context;
};
