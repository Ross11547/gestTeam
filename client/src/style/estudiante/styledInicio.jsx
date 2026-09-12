import styled from "styled-components";
import { Colors } from "../colors";

const sombraSuave = "0 4px 18px rgba(0, 0, 0, 0.07)";
const sombraTarjeta = "0 3px 12px rgba(0, 0, 0, 0.08)";

export const ContenedorInicio = styled.main`
  width: 100%;
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 2rem;

  padding-bottom: 2rem;

  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

export const FormularioBusqueda = styled.form`
  flex: 0 1 400px;

  width: min(100%, 400px);

  display: flex;
  justify-content: flex-end;

  margin-left: auto;

  @media (max-width: 768px) {
    flex: 1 1 100%;

    width: 100%;

    margin-left: 0;

    justify-content: stretch;
  }
`;

export const BarraBusquedaContenedor = styled.div`
  position: relative;

  width: 100%;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

export const BuscadorInput = styled.input`
  width: 100%;
  min-height: 46px;

  box-sizing: border-box;

  padding: 0.75rem 3rem 0.75rem 1.15rem;

  border: 1px solid #e5e7eb;
  border-radius: 999px;

  background: ${Colors.white};
  color: ${Colors.black};

  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

  font-size: 0.9rem;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #d1d5db;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
`;

export const IconoBuscador = styled.button`
  position: absolute;

  right: 0.55rem;
  top: 50%;

  transform: translateY(-50%);

  width: 36px;
  height: 36px;

  display: grid;
  place-items: center;

  border: 0;
  border-radius: 50%;

  background: transparent;

  color: ${({ $colors }) => $colors?.primary || "#f3b53f"};

  cursor: pointer;

  &:hover {
    background: ${({ $colors }) => $colors?.primary100 || "#fff7df"};
    color: ${({ $colors }) => $colors?.primary700 || "#f3b53f"};
  }
`;

export const SeccionBloque = styled.section`
  width: 100%;
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 1rem;
`;

export const CabeceraSeccion = styled.div`
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 1rem;

  flex-wrap: wrap;

  @media (max-width: 768px) {
    align-items: stretch;
  }
`;

export const TituloSeccion = styled.h2`
  margin: 0;

  display: flex;
  align-items: center;

  gap: 0.55rem;

  color: ${Colors.black};

  font-size: clamp(1.25rem, 2vw, 1.55rem);
  font-weight: 750;
`;

export const ContadorInsignia = styled.span`
  display: inline-flex;

  align-items: center;
  justify-content: center;

  min-width: 24px;
  min-height: 24px;

  padding: 0.1rem 0.55rem;

  border-radius: 999px;

  background: ${({ $colors }) => $colors?.primary200 || "#fff1bd"};

  color: ${({ $colors }) => $colors?.primary700 || "#7c5a00"};

  font-size: 0.75rem;
  font-weight: 750;
`;

export const ListaFacultades = styled.div`
  width: 100%;

  display: flex;

  gap: 0.75rem;

  overflow-x: auto;

  padding: 0.2rem 0 0.45rem;

  scrollbar-width: thin;
`;

export const PestanaFacultad = styled.button`
  flex: 0 0 auto;

  min-width: 105px;

  padding: 0.65rem 1.25rem;

  border: 1px solid
    ${({ $activa, $colors }) =>
      $activa ? $colors?.primary || "#f5b83b" : "#eeeeee"};

  border-radius: 999px;

  background: ${({ $activa, $colors }) =>
    $activa ? $colors?.primary || "#f5b83b" : Colors.white};

  color: ${({ $activa, $colors }) =>
    $activa ? Colors.white : $colors?.text || Colors.black};

  box-shadow: ${({ $activa }) =>
    $activa ? "none" : "0 2px 9px rgba(0,0,0,.07)"};

  font-size: 0.85rem;
  font-weight: 700;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

export const BotonFiltrosAvanzados = styled.button`
  display: inline-flex;

  align-items: center;

  gap: 0.45rem;

  min-height: 40px;

  padding: 0.55rem 1rem;

  border: 1px solid ${({ $colors }) => $colors?.primary || "#f3b53f"};

  border-radius: 999px;

  background: ${({ $activo, $colors }) =>
    $activo ? $colors?.primary || "#f3b53f" : Colors.white};

  color: ${({ $activo, $colors }) =>
    $activo
      ? Colors.white
      : $colors?.primary700 || $colors?.primary || "#9c6b00"};

  font-weight: 700;

  cursor: pointer;
`;

export const PanelFiltrosAvanzados = styled.div`
  padding: 1.2rem;

  border: 1px solid ${({ $colors }) => $colors?.primary200 || "#ececec"};

  border-radius: 16px;

  background: ${Colors.white};

  box-shadow: ${sombraSuave};
`;

export const RejillaFiltros = styled.div`
  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));

  gap: 0.85rem;
`;

export const GrupoFiltro = styled.label`
  display: flex;
  flex-direction: column;

  gap: 0.4rem;

  color: ${Colors.greyDark};

  font-size: 0.76rem;
  font-weight: 700;

  span {
    padding-left: 0.15rem;
  }
`;

export const SelectFiltro = styled.select`
  width: 100%;
  min-height: 42px;

  box-sizing: border-box;

  padding: 0.55rem 0.75rem;

  border: 1px solid ${({ $colors }) => $colors?.primary200 || "#dddddd"};

  border-radius: 9px;

  background: ${Colors.white};

  color: ${Colors.black};

  &:focus {
    outline: 2px solid ${({ $colors }) => $colors?.primary || "#f3b53f"};

    outline-offset: 1px;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const AccionesFiltros = styled.div`
  display: flex;
  justify-content: flex-end;

  margin-top: 1rem;
  padding-top: 0.85rem;

  border-top: 1px solid #eeeeee;
`;

export const BotonTexto = styled.button`
  border: 0;

  background: transparent;

  color: ${Colors.greyDark};

  font-weight: 700;

  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const RejillaProyectos = styled.div`
  width: 100%;

  display: grid;

  grid-template-columns: repeat(auto-fill, minmax(min(100%, 270px), 1fr));

  gap: 1.15rem;

  align-items: stretch;

  @media (min-width: 1750px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr));
  }

  @media (max-width: 590px) {
    grid-template-columns: 1fr;
  }
`;

export const TarjetaProyecto = styled.article`
  min-width: 0;

  display: flex;
  flex-direction: column;

  overflow: hidden;

  border: 1px solid ${({ $colors }) => $colors?.primary200 || "#ececec"};

  border-radius: 14px;

  background: ${Colors.white};

  box-shadow: ${sombraTarjeta};

  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-4px);

    border-color: ${({ $colors }) => $colors?.primary || "#f3b53f"};

    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.11);
  }
`;

export const ImagenProyecto = styled.img`
  display: block;

  width: 100%;
  height: 145px;

  object-fit: cover;

  background: #f3f4f6;
`;

export const SinImagenProyecto = styled.div`
  width: 100%;
  height: 145px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 0.55rem;

  box-sizing: border-box;

  padding: 1rem;

  background: ${({ $colors }) => $colors?.primary100 || "#fff8e3"};

  color: ${({ $colors }) =>
    $colors?.primary700 || $colors?.primary || "#9c6b00"};

  text-align: center;

  span {
    max-width: 90%;

    font-size: 0.78rem;
    font-weight: 700;
  }
`;

export const ContenidoTarjeta = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;

  gap: 0.8rem;

  padding: 0.85rem 0.9rem 0.95rem;
`;

export const FilaInsignias = styled.div`
  display: flex;
  align-items: center;

  flex-wrap: wrap;

  gap: 0.35rem;
`;

const insigniaBase = `
  display: inline-flex;
  align-items: center;
  gap: .2rem;

  padding: .2rem .55rem;

  border-radius: 999px;

  font-size: .68rem;
  font-weight: 750;
  line-height: 1.3;
`;

export const InsigniaEstado = styled.span`
  ${insigniaBase}

  ${({ $estado }) =>
    $estado === "ACTIVO"
      ? `
          background: #dcfce7;
          color: #166534;
        `
      : $estado === "CERRADO"
        ? `
            background: #e0e7ff;
            color: #3730a3;
          `
        : `
            background: #fef3c7;
            color: #92400e;
          `}
`;

export const InsigniaTipo = styled.span`
  ${insigniaBase}

  ${({ $tipo }) =>
    $tipo === "INDIVIDUAL"
      ? `
          background: #ede9fe;
          color: #6d28d9;
        `
      : $tipo === "GRUPAL"
        ? `
            background: #dcfce7;
            color: #15803d;
          `
        : `
            background: #f3e8ff;
            color: #7e22ce;
          `}
`;

export const InsigniaCategoria = styled.span`
  ${insigniaBase}

  background: ${({ $esIntegrador }) => ($esIntegrador ? "#fff1bd" : "#f3f4f6")};

  color: ${({ $esIntegrador }) =>
    $esIntegrador ? "#7c5a00" : Colors.greyDark};
`;

export const InsigniaDestacado = styled.span`
  ${insigniaBase}

  background: #fff7d6;

  color: #854d0e;
`;

export const TituloProyecto = styled.h3`
  margin: 0;

  color: ${Colors.black};

  font-size: 1.05rem;
  font-weight: 750;
  line-height: 1.25;

  overflow-wrap: anywhere;
`;

export const DescripcionProyecto = styled.p`
  margin: 0;

  color: #8b8b8b;

  font-size: 0.78rem;
  line-height: 1.45;

  display: -webkit-box;

  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  overflow: hidden;
`;

export const RejillaResumen = styled.div`
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 0.65rem;

  @media (max-width: 330px) {
    grid-template-columns: 1fr;
  }
`;

export const CajaResumen = styled.div`
  min-width: 0;
  min-height: 84px;

  display: flex;
  flex-direction: column;

  gap: 0.4rem;

  padding: 0.7rem;

  box-sizing: border-box;

  border-radius: 11px;

  background: ${({ $destacada, $colors }) =>
    $destacada ? $colors?.primary || "#f3b53f" : "#fafafa"};

  color: ${({ $destacada }) => ($destacada ? Colors.white : Colors.greyDark)};

  strong {
    display: flex;
    align-items: center;

    gap: 0.35rem;

    font-size: 0.75rem;
  }

  span {
    font-size: 0.72rem;
    line-height: 1.35;

    overflow-wrap: anywhere;
  }
`;

export const DocentesSection = styled.div`
  display: flex;
  flex-direction: column;

  gap: 0.45rem;

  color: ${Colors.black};

  > strong {
    display: flex;
    align-items: center;

    gap: 0.4rem;

    font-size: 0.76rem;
  }
`;

export const DocentesGrid = styled.div`
  display: flex;

  flex-wrap: wrap;

  gap: 0.3rem 0.8rem;

  span {
    color: ${Colors.greyDark};

    font-size: 0.72rem;
  }
`;

export const MetadatosProyecto = styled.div`
  display: flex;
  flex-direction: column;

  gap: 0.4rem;
`;

export const FilaMetadato = styled.div`
  min-width: 0;

  display: flex;
  align-items: flex-start;

  gap: 0.45rem;

  color: ${Colors.greyDark};

  font-size: 0.78rem;
  line-height: 1.45;

  svg {
    flex: 0 0 auto;

    margin-top: 0.05rem;

    color: ${({ $colors }) =>
      $colors?.primary700 || $colors?.primary || "#a76d00"};
  }

  span {
    min-width: 0;

    overflow-wrap: anywhere;
  }
`;

export const FilaAccionesTarjeta = styled.div`
  margin-top: auto;
  padding-top: 0.7rem;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  flex-wrap: wrap;

  gap: 0.5rem;

  border-top: 1px solid #eeeeee;

  @media (max-width: 380px) {
    > button {
      flex: 1;
    }
  }
`;

export const BotonPrimario = styled.button`
  min-height: 40px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 0.4rem;

  padding: 0.55rem 0.9rem;

  border: 0;
  border-radius: 9px;

  background: ${({ $colors }) => $colors?.primary || "#f3b53f"};

  color: ${Colors.white};

  font-weight: 700;

  cursor: pointer;

  transition:
    opacity 0.2s ease,
    transform 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;

    cursor: not-allowed;
  }
`;

export const BotonSecundario = styled.button`
  min-height: 40px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 0.4rem;

  padding: 0.55rem 0.9rem;

  border: 1px solid #dedede;
  border-radius: 9px;

  background: ${Colors.white};

  color: ${Colors.greyDark};

  font-weight: 700;

  cursor: pointer;

  &:hover {
    background: #fafafa;
  }
`;

export const EstadoCargando = styled.div`
  padding: 2.5rem 1rem;

  text-align: center;

  color: ${({ $colors }) =>
    $colors?.primary700 || $colors?.primary || Colors.greyDark};

  font-weight: 700;
`;

export const EstadoVacio = styled.div`
  display: flex;
  flex-direction: column;

  align-items: center;

  gap: 0.65rem;

  padding: 2.4rem 1rem;

  border: 1px dashed #d6d6d6;
  border-radius: 14px;

  color: ${Colors.greyDark};

  text-align: center;

  h4,
  p {
    margin: 0;
  }

  p {
    max-width: 430px;

    font-size: 0.85rem;
    line-height: 1.5;
  }
`;

export const PaginacionContenedor = styled.div`
  display: flex;

  align-items: center;
  justify-content: center;

  flex-wrap: wrap;

  gap: 0.8rem;

  padding-top: 1rem;
`;

export const BotonPaginacion = styled(BotonSecundario)`
  &:disabled {
    opacity: 0.45;

    cursor: not-allowed;
  }
`;

export const TextoPaginacion = styled.span`
  color: ${Colors.greyDark};

  font-size: 0.84rem;
`;

export const DetalleBackdrop = styled.div`
  position: fixed;

  inset: 0;

  z-index: 9999;

  display: flex;
  justify-content: flex-end;

  background: rgba(0, 0, 0, 0.26);

  backdrop-filter: blur(1px);
`;

export const PanelDetalle = styled.aside`
  width: min(500px, 100vw);
  height: 100dvh;

  display: flex;
  flex-direction: column;

  background: ${Colors.white};

  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.14);

  animation: aparecerDetalle 0.25s ease-out;

  overflow: hidden;

  @keyframes aparecerDetalle {
    from {
      transform: translateX(100%);
    }

    to {
      transform: translateX(0);
    }
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const CabeceraDetalle = styled.header`
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 1rem;

  padding: 1.15rem 1.35rem;

  border-bottom: 1px solid #eeeeee;

  h2 {
    margin: 0.55rem 0 0;

    color: #26313f;

    font-size: clamp(1.25rem, 3vw, 1.55rem);
    line-height: 1.25;
  }
`;

export const BotonCerrarDetalle = styled.button`
  flex: 0 0 auto;

  width: 40px;
  height: 40px;

  display: grid;
  place-items: center;

  border: 0;
  border-radius: 50%;

  background: transparent;

  color: #6b7280;

  cursor: pointer;

  &:hover {
    background: #f3f4f6;

    color: ${Colors.black};
  }
`;

export const CuerpoDetalle = styled.div`
  flex: 1;
  min-height: 0;

  overflow-y: auto;
`;

export const ImagenDetalle = styled.img`
  display: block;

  width: calc(100% - 2.5rem);
  height: 250px;

  margin: 1.25rem 1.25rem 0;

  border-radius: 12px;

  object-fit: cover;

  background: #f3f4f6;
`;

export const SinImagenDetalle = styled.div`
  width: calc(100% - 2.5rem);
  height: 230px;

  margin: 1.25rem 1.25rem 0;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 0.75rem;

  box-sizing: border-box;

  border-radius: 12px;

  background: ${({ $colors }) => $colors?.primary100 || "#fff8e3"};

  color: ${({ $colors }) =>
    $colors?.primary700 || $colors?.primary || "#9c6b00"};

  font-weight: 700;

  text-align: center;
`;

export const ContenidoDetalle = styled.div`
  display: flex;
  flex-direction: column;

  gap: 1.35rem;

  padding: 1.25rem;
`;

export const SeccionDetalle = styled.section`
  h3 {
    margin: 0 0 0.8rem;

    padding-bottom: 0.6rem;

    border-bottom: 2px solid #e8e8e8;

    color: #303b49;

    font-size: 1rem;
  }

  p {
    margin: 0;

    color: #7d8490;

    font-size: 0.86rem;
    line-height: 1.65;
  }
`;

export const BloqueDocumento = styled.div`
  display: flex;
  flex-direction: column;

  align-items: center;

  gap: 0.75rem;

  padding: 1.4rem;

  border: 1px dashed #d3d7dc;
  border-radius: 10px;

  background: #fbfbfc;

  color: #9299a3;

  text-align: center;

  svg {
    color: #a5abb4;
  }

  p {
    margin: 0;

    max-width: 330px;

    color: #7d8490;
  }

  small {
    max-width: 350px;

    font-size: 0.73rem;
    line-height: 1.5;
  }
`;

export const SelectorContexto = styled.div`
  width: 100%;
  display: grid;
  gap: 0.55rem;
`;

export const ContextoDocumental = styled.label`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem;
  border: 1px solid
    ${({ $activo, $colors }) =>
      $activo ? $colors?.primary || "#f3b53f" : "#e5e7eb"};
  border-radius: 9px;
  background: ${({ $activo, $colors }) =>
    $activo ? $colors?.primary100 || "#fff8e3" : Colors.white};
  color: ${Colors.greyDark};
  cursor: pointer;
  text-align: left;

  input {
    accent-color: ${({ $colors }) => $colors?.primary || "#f3b53f"};
  }

  span {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  strong,
  small {
    overflow-wrap: anywhere;
  }
`;

export const ListaDocumentos = styled.div`
  width: 100%;
  display: grid;
  gap: 0.45rem;
`;

export const SelectorDocumento = styled.label`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.65rem 0.7rem;
  border-radius: 9px;
  background: ${Colors.white};
  color: ${Colors.greyDark};
  cursor: pointer;
  text-align: left;

  input {
    flex: 0 0 auto;
    margin-top: 0.15rem;
  }

  span {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  strong,
  small {
    overflow-wrap: anywhere;
  }
`;

export const TextoMotivo = styled.textarea`
  width: 100%;
  min-height: 78px;
  resize: vertical;
  padding: 0.7rem;
  border: 1px solid #d3d7dc;
  border-radius: 9px;
  background: ${Colors.white};
  color: ${Colors.black};
  font: inherit;

  &:focus {
    outline: 2px solid ${({ $colors }) => $colors?.primary || "#f3b53f"};
    outline-offset: 1px;
  }
`;

export const MensajeSolicitud = styled.p`
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 9px;
  background: ${({ $tipo }) =>
    $tipo === "exito" ? "#dcfce7" : "#fee2e2"};
  color: ${({ $tipo }) => ($tipo === "exito" ? "#166534" : "#991b1b")};
  text-align: left;
`;

export const AvisoSeguro = styled.div`
  display: flex;

  align-items: flex-start;

  gap: 0.7rem;

  padding: 0.9rem 1rem;

  border: 1px solid
    ${({ $autorizado, $colors }) =>
      $autorizado ? $colors?.primary || "#d1d5db" : "#e5e7eb"};

  border-radius: 11px;

  background: ${({ $autorizado, $colors }) =>
    $autorizado && $colors?.primary100 ? $colors.primary100 : "#fafafa"};

  color: ${Colors.greyDark};

  font-size: 0.82rem;
  line-height: 1.5;

  svg {
    flex: 0 0 auto;

    color: ${({ $colors }) => $colors?.primary || Colors.greyDark};
  }
`;

export const PieDetalle = styled.footer`
  display: flex;

  align-items: center;
  justify-content: flex-end;

  flex-wrap: wrap;

  gap: 0.65rem;

  padding: 1rem 1.25rem;

  border-top: 1px solid #eeeeee;

  background: ${Colors.white};

  @media (max-width: 480px) {
    > button {
      flex: 1;
    }
  }
`;
