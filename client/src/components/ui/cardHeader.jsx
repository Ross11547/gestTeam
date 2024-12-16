import React from "react";
import Logo from "../../assets/img/headerPort.svg";
import {
  BackgroundIllustration,
  Header,
  HeaderContent,
  HeaderTitle,
  ImgLogo,
  Title,
} from "../../style/materiasStyled";

const CardHeader = ({ title, children }) => {
  return (
    <Header>
      <HeaderTitle>
        <Title>{title}</Title>
      </HeaderTitle>
      <HeaderContent>{children}</HeaderContent>
      <BackgroundIllustration>
        <ImgLogo src={Logo} />
      </BackgroundIllustration>
    </Header>
  );
};

export default CardHeader;
