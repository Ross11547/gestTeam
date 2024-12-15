import React, { useState } from 'react';
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
import Logo from "../../assets/img/logoDos.png";
import Fondo from "../../assets/img/FondoCinco.png";

const Login = () => {
  const [isActive, setIsActive] = useState(false);

  const handleFocus = () => setIsActive(true);
  const handleBlur = (e) => setIsActive(e.target.value !== "");
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
            <StyledInput active={isActive} onFocus={handleFocus} onBlur={handleBlur} type="email"/>
            <StyledLabel active={isActive}>Correo</StyledLabel>
          </InputWrapper>
          <InputWrapper>
            <StyledInput active={isActive} onFocus={handleFocus} onBlur={handleBlur} type="password"/>
            <StyledLabel active={isActive}>Contraseña</StyledLabel>
          </InputWrapper>
          <LoginButton>Ingresar</LoginButton>
        </Form>
      </LoginFormContainer>
    </LoginContainer>
  );
};

export default Login;
