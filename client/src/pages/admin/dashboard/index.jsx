import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from "recharts";
import {
  Users,
  GraduationCap,
  Building2,
  UserCheck,
  TrendingUp,
  Calendar,
  BookOpen,
  Boxes,
  FolderKanban,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  PageWrapper,
  Container,
  PageHeader,
  Title,
  DashboardHeaderContent,
  PageSubtitle,
  HeaderActions,
  HeaderMeta,
  DashboardGrid,
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardValue,
  DashboardIconBox,
  DashboardTrend,
  DashboardMainGrid,
  DashboardPanel,
  DashboardPanelLarge,
  DashboardPanelHeader,
  DashboardPanelTitle,
  DashboardPanelHint,
  QuickActionsGrid,
  QuickActionButton,
  StatusList,
  StatusItem,
  StatusInfo,
  StatusLabel,
  StatusDescription,
  StatusBadge,
  ErrorBox,
  ChartBox,
} from "../../../style/admin/generalStyle.jsx";

import { ColorsLogin, Colors } from "../../../style/colors";
import { authFetch } from "../../../services/api";
import { ROUTES } from "../../../enums/routes/Routes";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const BASE_FETCH = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

const formatNumber = (value) => {
  return Number(value ?? 0).toLocaleString("es-BO");
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [statsData, setStatsData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErr("");

        const sRes = await authFetch(`${BASE}/api/dashboard/summary`, BASE_FETCH);
        if (!sRes.ok)
          throw new Error(`Error al cargar resumen. HTTP ${sRes.status}`);

        const s = await sRes.json();

        const cards = [
          {
            label: "Docentes",
            value: s?.data?.docentes ?? 0,
            icon: Users,
            hint: "Docentes registrados",
          },
          {
            label: "Estudiantes",
            value: s?.data?.alumnos ?? 0,
            icon: GraduationCap,
            hint: "Alumnos activos",
          },
          {
            label: "Facultades",
            value: s?.data?.facultades ?? 0,
            icon: Building2,
            hint: "Facultades disponibles",
          },
          {
            label: "Directores",
            value: s?.data?.directores ?? 0,
            icon: UserCheck,
            hint: "Directores asignados",
          },
          {
            label: "Materias",
            value: s?.data?.materias ?? 0,
            icon: BookOpen,
            hint: "Materias registradas",
          },
          {
            label: "Paralelos",
            value: s?.data?.clases ?? 0,
            icon: Boxes,
            hint: "Clases abiertas",
          },
          {
            label: "Proyectos",
            value: s?.data?.proyectos ?? 0,
            icon: FolderKanban,
            hint: "Proyectos integradores",
          },
          {
            label: "Revisiones",
            value: s?.data?.revisiones ?? 0,
            icon: ShieldCheck,
            hint: "Entregas revisadas",
          },
        ];

        setStatsData(cards);

        setBarChartData(
          cards.slice(0, 4).map((c) => ({
            label: c.label,
            value: c.value,
          })),
        );

        const yearTo = new Date().getFullYear();
        const yearFrom = yearTo - 5;

        const gRes = await authFetch(
          `${BASE}/api/dashboard/student-growth?from=${yearFrom}&to=${yearTo}`,
          BASE_FETCH,
        );

        if (!gRes.ok)
          throw new Error(`Error al cargar crecimiento. HTTP ${gRes.status}`);

        const g = await gRes.json();
        setLineChartData(Array.isArray(g?.data) ? g.data : []);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const quickActions = [
    {
      label: "Crear periodo académico",
      icon: Calendar,
      route: ROUTES.PERIODOS_ADMIN || "/admin/periodos-academicos",
    },
    {
      label: "Gestionar clases / paralelos",
      icon: Boxes,
      route: ROUTES.CLASES_PARALELOS || "/admin/clases-paralelos",
    },
    {
      label: "Registrar materia",
      icon: BookOpen,
      route: ROUTES.MATERIAS || "/admin/materias",
    },
    {
      label: "Ver proyectos integradores",
      icon: FolderKanban,
      route: ROUTES.PROYECTOS_ADMIN || "/admin/proyectos",
    },
  ];

  const systemStatus = [
    {
      label: "Periodo académico",
      description: "Debe existir un periodo activo para abrir paralelos.",
      status: "Activo",
      type: "success",
    },
    {
      label: "Clases / Paralelos",
      description:
        "Centro operativo de materias, docentes, cupos e inscripciones.",
      status: "Prioridad",
      type: "warning",
    },
    {
      label: "Plagio / IA",
      description: "Módulo conectado a entregas y documentos.",
      status: "Pendiente",
      type: "danger",
    },
  ];

  return (
    <PageWrapper>
      <Container wide>
        <PageHeader>
          <DashboardHeaderContent>
            <Title>Panel Administrativo</Title>
            <PageSubtitle>
              Resumen general de usuarios, gestión académica y Proyecto
              Integrador.
            </PageSubtitle>
          </DashboardHeaderContent>

          <HeaderActions>
            <HeaderMeta>
              <Calendar size={20} />
              {new Date().toLocaleDateString("es-BO")}
            </HeaderMeta>
          </HeaderActions>
        </PageHeader>

        {err && <ErrorBox>{err}</ErrorBox>}

        <DashboardGrid>
          {(loading ? Array.from({ length: 8 }) : statsData).map(
            (item, index) => {
              const Icon = item?.icon || Users;

              return (
                <DashboardCard key={index}>
                  <DashboardCardHeader>
                    <div>
                      <DashboardCardTitle>
                        {loading ? "Cargando..." : item.label}
                      </DashboardCardTitle>

                      <DashboardCardValue>
                        {loading ? "..." : formatNumber(item.value)}
                      </DashboardCardValue>
                    </div>

                    <DashboardIconBox>
                      <Icon size={27} />
                    </DashboardIconBox>
                  </DashboardCardHeader>

                  <DashboardTrend>
                    <TrendingUp size={16} />
                    <span>{loading ? "Obteniendo datos" : item.hint}</span>
                  </DashboardTrend>
                </DashboardCard>
              );
            },
          )}
        </DashboardGrid>

        <DashboardMainGrid>
          <DashboardPanel>
            <DashboardPanelHeader>
              <DashboardPanelTitle>
                Distribución universitaria
              </DashboardPanelTitle>
              <DashboardPanelHint>
                Usuarios y estructura base
              </DashboardPanelHint>
            </DashboardPanelHeader>

            <ChartBox height="360px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={loading ? [] : barChartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e8e8e8"
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: Colors.greyDark,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: Colors.greyLight,
                      fontSize: 12,
                    }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill={ColorsLogin.secondary100}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>
          </DashboardPanel>

          <DashboardPanel>
            <DashboardPanelHeader>
              <DashboardPanelTitle>Acciones rápidas</DashboardPanelTitle>
              <DashboardPanelHint>Flujo recomendado</DashboardPanelHint>
            </DashboardPanelHeader>

            <QuickActionsGrid>
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <QuickActionButton
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.route)}
                  >
                    <Icon size={21} />
                    <span>{action.label}</span>
                    <Plus size={18} style={{ marginLeft: "auto" }} />
                  </QuickActionButton>
                );
              })}
            </QuickActionsGrid>
          </DashboardPanel>
        </DashboardMainGrid>

        <DashboardMainGrid>
          <DashboardPanel>
            <DashboardPanelHeader>
              <DashboardPanelTitle>
                Crecimiento de estudiantes
              </DashboardPanelTitle>
              <DashboardPanelHint>Últimos años registrados</DashboardPanelHint>
            </DashboardPanelHeader>

            <ChartBox height="340px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={loading ? [] : lineChartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: Colors.greyDark,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: Colors.greyLight,
                      fontSize: 12,
                    }}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="estudiantes"
                    stroke={ColorsLogin.secondary200}
                    strokeWidth={3}
                    dot={{
                      fill: ColorsLogin.secondary200,
                      strokeWidth: 2,
                      stroke: Colors.white,
                      r: 5,
                    }}
                    activeDot={{
                      r: 7,
                      fill: ColorsLogin.secondary300,
                      stroke: Colors.white,
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>
          </DashboardPanel>

          <DashboardPanel>
            <DashboardPanelHeader>
              <DashboardPanelTitle>Estado del sistema</DashboardPanelTitle>
              <DashboardPanelHint>Módulos clave</DashboardPanelHint>
            </DashboardPanelHeader>

            <StatusList>
              {systemStatus.map((item) => (
                <StatusItem key={item.label}>
                  <StatusInfo>
                    <StatusLabel>{item.label}</StatusLabel>
                    <StatusDescription>{item.description}</StatusDescription>
                  </StatusInfo>

                  <StatusBadge type={item.type}>{item.status}</StatusBadge>
                </StatusItem>
              ))}
            </StatusList>
          </DashboardPanel>
        </DashboardMainGrid>

        <DashboardPanelLarge>
          <DashboardPanelHeader>
            <DashboardPanelTitle>
              Prioridad de implementación
            </DashboardPanelTitle>
            <DashboardPanelHint>
              Orden recomendado para terminar administrador
            </DashboardPanelHint>
          </DashboardPanelHeader>

          <StatusList>
            <StatusItem>
              <StatusInfo>
                <StatusLabel>1. Periodos académicos</StatusLabel>
                <StatusDescription>
                  Base para abrir clases, paralelos, inscripciones y proyectos.
                </StatusDescription>
              </StatusInfo>
              <StatusBadge type="success">Base</StatusBadge>
            </StatusItem>

            <StatusItem>
              <StatusInfo>
                <StatusLabel>2. Clases / Paralelos</StatusLabel>
                <StatusDescription>
                  Une materia, periodo, docente, aula, cupo, estudiantes y
                  proyectos.
                </StatusDescription>
              </StatusInfo>
              <StatusBadge type="warning">Clave</StatusBadge>
            </StatusItem>

            <StatusItem>
              <StatusInfo>
                <StatusLabel>3. Inscripciones</StatusLabel>
                <StatusDescription>
                  Permite asignar estudiantes a una clase/paralelo específico.
                </StatusDescription>
              </StatusInfo>
              <StatusBadge>Académico</StatusBadge>
            </StatusItem>

            <StatusItem>
              <StatusInfo>
                <StatusLabel>4. Proyecto Integrador</StatusLabel>
                <StatusDescription>
                  Proyectos, equipos, hitos, entregas, revisiones, plagio e
                  integración GitHub.
                </StatusDescription>
              </StatusInfo>
              <StatusBadge>GestTeam</StatusBadge>
            </StatusItem>
          </StatusList>
        </DashboardPanelLarge>
      </Container>
    </PageWrapper>
  );
};

export default Dashboard;
