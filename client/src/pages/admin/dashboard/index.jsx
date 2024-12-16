import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  GraduationCap,
  Building2,
  UserCheck,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  DashboardWrapper,
  Card,
  CardCharts,
  CardHeader,
  CardTitle,
  CardValue,
  ChartCard,
  ChartTitle,
  DashboardContainer,
  GridContainer,
  HeaderMeta,
  HeaderTitle,
  PageHeader,
} from "../../../style/admin/dashboardAdmin";
import { ColorsLogin as Colors } from "../../../style/colors";

const Dashboard = () => {
  const statsData = [
    {
      label: "Docentes",
      value: 250,
      icon: Users,
    },
    {
      label: "Alumnos",
      value: 2000,
      icon: GraduationCap,
    },
    {
      label: "Facultades",
      value: 5,
      icon: Building2,
    },
    {
      label: "Directores",
      value: 5,
      icon: UserCheck,
    },
  ];

  const barChartData = [
    { label: "Docentes", value: 240 },
    { label: "Alumnos", value: 2000 },
    { label: "Facultades", value: 5 },
    { label: "Directores", value: 5 },
  ];

  const lineChartData = [
    { name: "2020", estudiantes: 4500 },
    { name: "2021", estudiantes: 4700 },
    { name: "2022", estudiantes: 4900 },
    { name: "2023", estudiantes: 6000 },
  ];

  return (
    <DashboardWrapper>
      <DashboardContainer>
        <PageHeader>
          <HeaderTitle>Panel Universitario</HeaderTitle>
          <HeaderMeta>
            <Calendar size={20} />
            {new Date().toLocaleDateString()}
          </HeaderMeta>
        </PageHeader>

        <GridContainer>
          {statsData.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>
                  <item.icon size={20} color={Colors.secondary100} />
                  {item.label}
                </CardTitle>
                <TrendingUp color={Colors.secondary100} />
              </CardHeader>
              <CardValue>{item.value.toLocaleString()}</CardValue>
            </Card>
          ))}

          <ChartCard>
            <ChartTitle>Distribución Universitaria</ChartTitle>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={barChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={Colors.secondary100}
                />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  contentStyle={{
                    borderRadius: "10px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={Colors.secondary100}
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <Card>
            <CardCharts>
              <ChartTitle>Crecimiento de Estudiantes</ChartTitle>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="estudiantes"
                    stroke={Colors.accent}
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardCharts>
          </Card>
        </GridContainer>
      </DashboardContainer>
    </DashboardWrapper>
  );
};

export default Dashboard;
