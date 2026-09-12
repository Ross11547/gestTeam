import PropTypes from "prop-types";

import Logo from "../../assets/img/headerPort.svg";

import {
  BackgroundIllustration,
  Header,
  HeaderContent,
  HeaderTitle,
  ImgLogo,
  Parrafo,
  Title,
} from "../../style/estudiante/materiasStyled.jsx";

import { useColors } from "../../style/colors.jsx";

const CardHeader = ({ title, parrafo, children }) => {
  const colorsCard = useColors();

  return (
    <Header ColorsCard={colorsCard}>
      <HeaderTitle>
        <Title>{title}</Title>

        {parrafo && <Parrafo>{parrafo}</Parrafo>}
      </HeaderTitle>

      <HeaderContent>{children}</HeaderContent>

      <BackgroundIllustration>
        <ImgLogo src={Logo} alt="" aria-hidden="true" />
      </BackgroundIllustration>
    </Header>
  );
};

CardHeader.propTypes = {
  title: PropTypes.string.isRequired,
  parrafo: PropTypes.string,
  children: PropTypes.node,
};

CardHeader.defaultProps = {
  parrafo: "",
  children: null,
};

export default CardHeader;