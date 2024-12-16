import styled from "styled-components";
import { Colors as Colores, ColorsLogin } from "../colors";
const Colors = {
  background: "#f4f7fa",
  primary: `${ColorsLogin.secondary100}`,
  secondary: "#F89C5E",
  text: "#333333",
  lightText: "#666666",
  border: "#E0E0E0",
};

export const DashboardWrapper = styled.div`
  min-height: 100vh;
  padding-bottom: 40px;
`;

export const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

export const PageHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const HeaderTitle = styled.h1`
  color: ${Colors.primary};
  font-size: 2rem;
  margin: 0;
`;

export const HeaderMeta = styled.div`
  color: ${Colors.lightText};
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

export const Card = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.3s ease;
  border: 1px solid ${Colors.border};
  display: flex;
  flex-direction: column;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  }
`;
export const CardCharts = styled.div`
  width: 700px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.3s ease;
  border: 1px solid ${Colors.border};
  display: flex;
  flex-direction: column;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

export const CardTitle = styled.h3`
  color: ${Colors.primary};
  font-size: 1.1rem;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const CardValue = styled.div`
  font-size: 2.2rem;
  font-weight: bold;
  color: ${Colors.text};
  text-align: right;
  margin-top: auto;
`;

export const ChartCard = styled(Card)`
  grid-column: 1 / -1;
  height: 450px;
`;

export const ChartTitle = styled.h2`
  color: ${Colors.primary};
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.4rem;
`;
