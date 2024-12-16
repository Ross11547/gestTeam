import React, { useState } from "react";
import {
  Layout,
  Calendar,
  Mail,
  Bell,
  PlusCircle,
  ChevronsLeft,
  ChevronsRight,
  User,
  Trello,
  UserCircle,
  LogOut,
} from "lucide-react";
import {
  GlobalStyle,
  AppContainer,
  Badge,
  CreateTaskButto2,
  CreateTaskButton,
  IconWrapper,
  MenuItem,
  MinimizedIconContainer,
  ProfileSection,
  SectionTitle,
  ServiceItem,
  ServiceSection,
  SidebarContent,
  SidebarWrapper,
  ToggleButton,
  colors,
  Profile,
  TitleMenu,
  FotoPerfil,
} from "../style/navbar";
import { Link } from "react-router-dom";
import { ROUTES } from "../enums/routes/Routes";
import Foto from "../assets/img/Foto.jpg";
import { useUser } from "../context/useContext";
const SidebarNavigation = ({ minimized, toggleSidebar }) => {
  const [activeItem, setActiveItem] = useState("project");
  const { user, logout } = useUser();
  console.log(user);
  const menuItems =
    user?.rol === "Estudiante"
      ? [
          {
            icon: <Layout size={20} />,
            label: "Inicio",
            key: "dashboard",
            route: ROUTES.DASHBOARD,
          },
          {
            icon: <Trello size={20} />,
            label: "Materias",
            key: "materias",
            route: ROUTES.MATERIA,
          },
          {
            icon: <Calendar size={20} />,
            label: "Proyectos",
            key: "proyectos",
            route: ROUTES.PROYECTO,
            extra: "+",
          },
          {
            icon: <Mail size={20} />,
            label: "Colaboraciones",
            key: "colaboraciones",
            route: ROUTES.COLABORACION,
            badge: 3,
          },
          {
            icon: <Bell size={20} />,
            label: "Notificationes",
            key: "notificaciones",
            route: ROUTES.NOTIFICACION,
          },
          {
            icon: <Layout size={20} />,
            label: "Pizarra",
            key: "pizarra",
            route: ROUTES.PIZARRA,
          },
        ]
      : [
          {
            icon: <Layout size={20} />,
            label: "Docentes",
            key: "docentes",
            route: ROUTES.DOCENTE,
          },
          {
            icon: <Trello size={20} />,
            label: "Alumnos",
            key: "alumno",
            route: ROUTES.USUARIO,
          },
          {
            icon: <Calendar size={20} />,
            label: "Facultades",
            key: "facultades",
            route: ROUTES.FACULTAD,
          },
          {
            icon: <UserCircle size={20} />,
            label: "Directores de carrera",
            key: "directoresCarreras",
            route: ROUTES.DIRECTOCARRERA,
          },
        ];

  const services = [];

  const toggleMinimize = toggleSidebar;
  if (minimized) {
    return (
      <>
        <GlobalStyle />
        <AppContainer>
          <SidebarWrapper minimized={true}>
            <ToggleButton onClick={toggleMinimize}>
              <ChevronsRight size={20} color={colors.primary} />
            </ToggleButton>
            <Profile>
              <FotoPerfil src={Foto} alt="" />
            </Profile>

            <TitleMenu>
              <span>Menu</span>
            </TitleMenu>

            <MinimizedIconContainer>
              {menuItems.map((item) => (
                <div
                  key={item.key}
                  style={{ margin: "10px 0", opacity: 0.7, cursor: "pointer" }}
                >
                  {item.icon}
                </div>
              ))}
            </MinimizedIconContainer>
            <CreateTaskButto2>+</CreateTaskButto2>
          </SidebarWrapper>
        </AppContainer>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <SidebarWrapper minimized={false}>
          <ToggleButton onClick={toggleMinimize}>
            <ChevronsLeft size={20} color={colors.primary} />
          </ToggleButton>
          <SidebarContent minimized={false}>
            <ProfileSection>
              <FotoPerfil src={Foto} alt="" />
              <div>
                <div style={{ color: colors.text.light, fontSize: "0.9em" }}>
                  Buenos dias 👋
                </div>
                <div style={{ fontWeight: "bold", color: colors.text.dark }}>
                  {user?.nombre} {user?.apellido}
                </div>
              </div>
            </ProfileSection>

            <SectionTitle>
              <span>Menu</span>
            </SectionTitle>

            {menuItems.map((item) => (
              <Link
                key={item.key}
                to={item.route}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <MenuItem
                  active={activeItem === item.key}
                  onClick={() => setActiveItem(item.key)}
                >
                  <IconWrapper active={activeItem === item.key}>
                    {item.icon}
                  </IconWrapper>
                  {item.label}
                  {item.badge && <Badge>{item.badge}</Badge>}
                  {item.extra && (
                    <span style={{ marginLeft: "auto" }}>{item.extra}</span>
                  )}
                </MenuItem>
              </Link>
            ))}

            {user?.rol === "Estudiante" ? (
              <>
                <SectionTitle>
                  <span>Herramientas</span>
                </SectionTitle>

                <ServiceSection>
                  {services.map((service, index) => (
                    <ServiceItem key={index}>
                      {service.icon}
                      <span style={{ marginLeft: "10px" }}>
                        {service.label}
                      </span>
                    </ServiceItem>
                  ))}
                  <ServiceItem>
                    <PlusCircle
                      size={24}
                      color={colors.primary}
                      style={{ marginRight: "10px" }}
                    />
                    Añadir una herramienta
                  </ServiceItem>
                </ServiceSection>

                <CreateTaskButton onClick={() => logout()}>
                  <LogOut size={24} style={{ marginRight: "10px" }} />
                  Salir
                </CreateTaskButton>
              </>
            ) : (
              <>
                {" "}
                <CreateTaskButton onClick={() => logout()}>
                  <LogOut size={24} style={{ marginRight: "10px" }} />
                  Salir
                </CreateTaskButton>
              </>
            )}
          </SidebarContent>
        </SidebarWrapper>
      </AppContainer>
    </>
  );
};

export default SidebarNavigation;
