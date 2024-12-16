import React, { Children } from "react";
import Logo from "../../assets/img/headerPort.svg";
import {
  BackgroundIllustration,
  Header,
  HeaderContent,
  HeaderTitle,
  ImgLogo,
  Title,
} from "../../style/materiasStyled";

const CardHeader = ({ title, Children }) => {
  return (
    <Header>
      <HeaderTitle>
        <Title>{title}</Title>
      </HeaderTitle>
      <HeaderContent>{Children}</HeaderContent>
      <BackgroundIllustration>
        <ImgLogo src={Logo} />
      </BackgroundIllustration>
    </Header>
  );
};

export default CardHeader;
