import { useState } from "react";
import {
  LoginContainer,
  BackgroundImage,
  LoginFormContainer,
  LoginTitle,
  LoginButton,
  LogoImage,
  LogoContainer,
  Form,
  InputWrapper,
  StyledLabel,
  StyledInput,
} from "../../style/loginStyle.jsx";
import Fondo from "../../assets/img/FondoCinco.png";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../enums/routes/Routes.js";
import { toast } from "sonner";
import { useUser } from "../../context/useContext.jsx";
import { Url } from "../../config.js";

const normalizeRoleName = (role) => {
  if (!role) return "";

  if (typeof role === "string") {
    return role.trim().toLowerCase();
  }

  if (typeof role?.nombre === "string") {
    return role.nombre.trim().toLowerCase();
  }

  if (typeof role?.name === "string") {
    return role.name.trim().toLowerCase();
  }

  return "";
};

const getPayloadRoleName = (payload) => {
  const roleName = normalizeRoleName(
    payload?.rol || payload?.Rol || payload?.role
  );

  if (roleName) return roleName;

  const idRol = Number(payload?.idRol);

  if (idRol === 1) return "admin";
  if (idRol === 2) return "estudiante";
  if (idRol === 3) return "director";
  if (idRol === 4) return "docente";

  return "";
};

const getDashboardRoute = (payload) => {
  const roleName = getPayloadRoleName(payload);

  if (roleName === "admin" || roleName === "administrador") {
    return ROUTES.DASHBOARDADMIN;
  }

  if (roleName === "director") {
    return ROUTES.DASHBOARDDI;
  }

  if (roleName === "docente") {
    return ROUTES.DASHBOARDDOCENTE;
  }

  return ROUTES.DASHBOARD;
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();

  const [isActive, setIsActive] = useState(false);
  const [form, setForm] = useState({
    correo: "",
    password: "",
  });

  const handleFocus = () => setIsActive(true);

  const handleBlur = (e) => setIsActive(Boolean(e.target.value));

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const base = Url.endsWith("/") ? Url.slice(0, -1) : Url;

      const response = await fetch(`${base}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.mensaje || "Error al iniciar sesión");
        return;
      }

      if (data?.token) {
        localStorage.setItem("gt_token", data.token);
      }

      const mensaje = data?.mensaje;
      const payload = data?.data || data?.usuario || data?.user;

      if (!payload) {
        toast.error("No se recibió información del usuario");
        return;
      }

      if (mensaje === "Inicio de sesión correcto") {
        login(payload);
        toast.success(mensaje);

        navigate(getDashboardRoute(payload), {
          replace: true,
        });

        return;
      }

      toast.error(mensaje || "Error al iniciar sesión");
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión con el servidor");
    }
  };

  return (
    <LoginContainer>
      <BackgroundImage src={Fondo} alt="Imagen de fondo" />

      <LoginFormContainer>
        <LogoContainer>
          <LogoImage src="" alt="" />
        </LogoContainer>

        <LoginTitle>Login</LoginTitle>

        <Form onSubmit={handleSubmit}>
          <InputWrapper>
            <StyledInput
              name="correo"
              value={form.correo}
              onChange={handleChange}
              type="email"
              active={isActive}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
            <StyledLabel active={isActive}>Correo</StyledLabel>
          </InputWrapper>

          <InputWrapper>
            <StyledInput
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              active={isActive}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
            <StyledLabel active={isActive}>Contraseña</StyledLabel>
          </InputWrapper>

          <LoginButton type="submit">Ingresar</LoginButton>
        </Form>
      </LoginFormContainer>
    </LoginContainer>
  );
};

export default Login;