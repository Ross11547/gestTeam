import React, { useState } from "react";
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

const Login = () => {
  const navigation = useNavigate();
  const { login } = useUser();
  const [isActive, setIsActive] = useState(false);
  const [form, setForm] = useState({
    correo: "",
    password: "",
  });
  const handleFocus = () => setIsActive(true);
  const handleBlur = (e) => setIsActive(e.target.value !== "");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handlesubmit = async (e) => {
    e.preventDefault();
    console.log(form);
    try {
      const response = await fetch(`${Url}login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data);
        console.log(response);
        if (data.mensaje == "Inicio de sesión correcto") {
          login(data.data);
          toast.success(data.mensaje);
          navigation(ROUTES.DASHBOARD);
        }
        if (data.mensaje == "Usuario no autorizado") {
          toast.error(data.mensaje);
        }
      } else {
        toast.error(data.mensaje || "Error al iniciar sesión");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    }
  };
  return (
    <LoginContainer>
      <BackgroundImage src={Fondo} alt="Imagen de fondo" />
      <LoginFormContainer>
        <LogoContainer>
          <LogoImage src={{}} alt="" />
        </LogoContainer>
        <LoginTitle>Login</LoginTitle>
        <Form onSubmit={handlesubmit}>
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
              active={isActive}
              onFocus={handleFocus}
              onBlur={handleBlur}
              type="password"
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
