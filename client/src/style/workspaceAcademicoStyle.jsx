import styled from "styled-components";

export const Pagina = styled.div`
  width: 100%;
  max-width: 1440px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 1rem 1rem 2rem;
  color: #263238;

  @media (max-width: 760px) {
    > header {
      height: auto;
      min-height: 260px;
    }

    > header > div:first-child {
      position: relative;
      z-index: 2;

      p {
        width: 100%;
      }
    }

    > header > div:nth-child(2) {
      min-height: 120px;
    }

    > header > div:last-child {
      display: none;
    }
  }

  @media (max-width: 600px) {
    padding: 0.75rem;

    > header {
      padding: 16px;
      border-radius: 20px;
    }

    > header h1 {
      font-size: 1.8rem;
    }
  }
`;

export const ResumenPortada = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 60%;
  height: 100%;
  padding: 20px;
  color: #263238;

  strong,
  span {
    display: block;
  }

  strong {
    margin-bottom: 6px;
    font-size: 1.1rem;
  }

  span {
    color: #66737b;
    line-height: 1.45;
  }

  @media (max-width: 760px) {
    width: 100%;
    padding: 16px;
  }

  @media (max-width: 480px) {
    gap: 12px;

    span {
      font-size: 0.85rem;
    }
  }
`;

export const IconoPortada = styled.div`
  display: grid;
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  place-items: center;
  border-radius: 14px;
  color: #fff;
  background: ${({ $colores }) => $colores.primary};
  box-shadow: 0 8px 18px ${({ $colores }) => `${$colores.primary}40`};
`;

export const Distribucion = styled.div`
  display: grid;
  grid-template-columns: minmax(230px, 290px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

export const PanelLista = styled.aside`
  position: sticky;
  top: 16px;
  padding: 18px;
  border: 1px solid #e5e9ec;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  @media (max-width: 820px) {
    position: static;
  }
`;

export const TituloPanel = styled.h2`
  margin: 0 0 14px;
  font-size: 1rem;
`;

export const ListaProyectos = styled.div`
  display: grid;
  gap: 10px;

  @media (max-width: 820px) {
    display: flex;
    overflow-x: auto;
    padding-bottom: 4px;
  }
`;

export const ProyectoBoton = styled.button`
  min-width: 0;
  padding: 14px;
  border: 1px solid
    ${({ $activo, $colores }) => ($activo ? $colores.primary : "#e3e7ea")};
  border-radius: 12px;
  text-align: left;
  color: #263238;
  background: ${({ $activo, $colores }) =>
    $activo ? $colores.primary100 : "#fff"};
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: ${({ $colores }) => $colores.primary};
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  > span {
    display: block;
    margin: 6px 0 10px;
    color: #6b767c;
    font-size: 0.82rem;
  }

  @media (max-width: 820px) {
    min-width: 230px;
  }
`;

export const ProyectoLinea = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;

  strong {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const PanelDetalle = styled.main`
  display: grid;
  gap: 20px;
  min-width: 0;
`;

export const CabeceraProyecto = styled.section`
  padding: clamp(20px, 4vw, 30px);
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(
    135deg,
    ${({ $colores }) => $colores.primary} 0%,
    ${({ $colores }) => $colores.primary100} 100%
  );
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

export const Etiqueta = styled.span`
  display: block;
  margin-bottom: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.78;
`;

export const TituloProyecto = styled.h2`
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 2rem);
`;

export const Descripcion = styled.p`
  max-width: 760px;
  margin: 9px 0 0;
  line-height: 1.55;
  opacity: 0.9;
`;

export const Resumen = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 24px;

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

export const DatoResumen = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);

  strong {
    display: block;
    font-size: 0.88rem;
  }
`;

export const Estado = styled.span`
  display: inline-flex;
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  color: ${({ $estado }) =>
    ["ACTIVO", "EN_CURSO", "FINALIZADO"].includes($estado)
      ? "#176b48"
      : "#58636a"};
  background: ${({ $estado }) =>
    ["ACTIVO", "EN_CURSO", "FINALIZADO"].includes($estado)
      ? "#dff6eb"
      : "#edf0f2"};
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.03em;
`;

export const Seccion = styled.section`
  padding: clamp(18px, 3vw, 24px);
  border: 1px solid #e5e9ec;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

export const CabeceraSeccion = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 2px solid #f1f3f4;
  color: #455159;
`;

export const TituloSeccion = styled.h3`
  margin: 0;
  color: #263238;
  font-size: 1.04rem;
`;

export const TextoAuxiliar = styled.span`
  display: block;
  margin-top: 4px;
  color: #738087;
  font-size: 0.8rem;
`;

export const RejillaContextos = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
`;

export const TarjetaContexto = styled.article`
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
  padding: 16px;
  border: 1px solid #e7ebed;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);

  > span {
    color: #6a767d;
    font-size: 0.82rem;
  }
`;

export const Codigo = styled.span`
  width: fit-content;
  padding: 3px 7px;
  border-radius: 5px;
  color: #49545a !important;
  background: #e9edef;
  font-size: 0.7rem !important;
  font-weight: 800;
`;

export const BotonDetalle = styled.button`
  width: fit-content;
  margin-top: 4px;
  padding: 0;
  border: 0;
  color: ${({ $colores }) => $colores.primary700};
  background: transparent;
  font: inherit;
  font-size: 0.79rem;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: wait;
  }
`;

export const DetalleSecundario = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 5px;
  padding-top: 9px;
  border-top: 1px solid #e4e9eb;
  color: #66737a;
  font-size: 0.78rem;
`;

export const RejillaEquipos = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(245px, 1fr));
  gap: 14px;
`;

export const TarjetaEquipo = styled.article`
  padding: 16px;
  border: 1px solid #e6eaed;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
`;

export const FilaEquipo = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;

  span {
    display: block;
    margin-top: 3px;
    color: #758087;
    font-size: 0.78rem;
  }
`;

export const Contador = styled.span`
  display: grid !important;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  margin: 0 !important;
  place-items: center;
  border-radius: 50%;
  color: #364147 !important;
  background: #edf0f2;
  font-weight: 800;
`;

export const ListaMiembros = styled.div`
  display: grid;
  gap: 9px;
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid #edf0f1;
`;

export const Miembro = styled.div`
  display: flex;
  gap: 9px;
  align-items: center;

  strong,
  span {
    display: block;
    font-size: 0.79rem;
  }

  span {
    margin-top: 2px;
    color: #778289;
    font-size: 0.68rem;
  }
`;

export const Avatar = styled.div`
  display: grid;
  width: 31px;
  height: 31px;
  flex: 0 0 31px;
  place-items: center;
  border-radius: 9px;
  color: ${({ $colores }) => $colores.primary700};
  background: ${({ $colores }) => $colores.primary100};
  font-size: 0.76rem;
  font-weight: 900;
`;

export const LineaTiempo = styled.div`
  display: grid;
`;

export const Hito = styled.article`
  position: relative;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 13px;
  padding-bottom: 18px;

  &:not(:last-child)::before {
    position: absolute;
    top: 40px;
    bottom: 2px;
    left: 23px;
    width: 2px;
    background: #e3e7e9;
    content: "";
  }
`;

export const MarcaHito = styled.div`
  z-index: 1;
  display: grid;
  width: 46px;
  height: 40px;
  place-items: center;
  border-radius: 11px;
  color: ${({ $colores }) => $colores.primary700};
  background: ${({ $colores }) => $colores.primary100};
  font-size: 0.78rem;
  font-weight: 900;
`;

export const ContenidoHito = styled.div`
  min-width: 0;
  padding: 14px;
  border: 1px solid #e7ebed;
  border-radius: 12px;
  background: #fff;

  p {
    margin: 9px 0 4px;
    color: #69757c;
    font-size: 0.82rem;
    line-height: 1.5;
  }
`;

export const FilaHito = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;

  span:not(:last-child) {
    display: block;
    margin-top: 4px;
    color: #7a858b;
    font-size: 0.75rem;
  }

  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

export const VacioSeccion = styled.div`
  padding: 20px;
  border: 1px dashed #d8dfe2;
  border-radius: 11px;
  color: #738087;
  text-align: center;
  font-size: 0.86rem;
`;

export const EstadoVacio = styled.div`
  display: grid;
  min-height: 260px;
  padding: 30px;
  place-items: center;
  align-content: center;
  gap: 9px;
  border: 1px solid #e4e9eb;
  border-radius: 12px;
  color: #68757c;
  text-align: center;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  strong {
    color: #344047;
  }
`;

export const BotonReintentar = styled.button`
  display: inline-flex;
  gap: 7px;
  align-items: center;
  margin-top: 7px;
  padding: 10px 15px;
  border: 0;
  border-radius: 9px;
  color: #fff;
  background: ${({ $colores }) => $colores.primary};
  font-weight: 800;
  cursor: pointer;
`;

export const Cargador = styled.div`
  width: 28px;
  height: 28px;
  border: 3px solid #e4e8ea;
  border-top-color: ${({ $colores }) => $colores.primary};
  border-radius: 50%;
  animation: girar 0.8s linear infinite;

  @keyframes girar {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const ErrorSecundario = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 11px 13px;
  border: 1px solid #f1caca;
  border-radius: 10px;
  color: #8c3030;
  background: #fff4f4;
  font-size: 0.83rem;
`;
