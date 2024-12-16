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

const Login = () => {
  const navigation = useNavigate();
  const [isActive, setIsActive] = useState(false);

  const handleFocus = () => setIsActive(true);
  const handleBlur = (e) => setIsActive(e.target.value !== "");
  const handlesubmit = () => {
    navigation(ROUTES.DASHBOARD);
  };
  return (
    <LoginContainer>
      <BackgroundImage src={Fondo} alt="Imagen de fondo" />
      <LoginFormContainer>
        <LogoContainer>
          <LogoImage src={{}} alt="" />
        </LogoContainer>
        <LoginTitle>Login</LoginTitle>
        <Form>
          <InputWrapper>
            <StyledInput
              active={isActive}
              onFocus={handleFocus}
              onBlur={handleBlur}
              type="email"
            />
            <StyledLabel active={isActive}>Correo</StyledLabel>
          </InputWrapper>
          <InputWrapper>
            <StyledInput
              active={isActive}
              onFocus={handleFocus}
              onBlur={handleBlur}
              type="password"
            />
            <StyledLabel active={isActive}>Contraseña</StyledLabel>
          </InputWrapper>
          <LoginButton onClick={handlesubmit}>Ingresar</LoginButton>
        </Form>
      </LoginFormContainer>
    </LoginContainer>
  );
};

export default Login;
