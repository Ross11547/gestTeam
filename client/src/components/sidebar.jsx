import React, { useState } from "react";
import { Layout, Calendar, Mail, Bell, PlusCircle, ChevronsLeft, ChevronsRight, Trello, CalendarDays } from "lucide-react";
import { GlobalStyle, AppContainer, Badge, CreateTaskButto2, CreateTaskButton, IconWrapper, MenuItem, MinimizedIconContainer, ProfileSection, SectionTitle, ServiceItem, ServiceSection, SidebarContent, SidebarWrapper, ToggleButton, colors, Profile, TitleMenu, FotoPerfil, Calen } from "../style/navbar";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../enums/routes/Routes";
import Foto from "../assets/img/Foto.jpg";
import { Colors, ColorsLogin } from "../style/colors";
const SidebarNavigation = ({ minimized, toggleSidebar }) => {
  const [activeItem, setActiveItem] = useState("project");
  const navigate = useNavigate();

  const menuItems = [
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

  const handleCalendario = () => {
    navigate(ROUTES.CALENDARIOU);
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
                  Rossana Trujillo
                </div>
              </div>
            </ProfileSection>
            <div>
              <SectionTitle>
                <span>Menu</span>
                <Calen onClick={handleCalendario}><CalendarDays size={22}/></Calen>
              </SectionTitle>

            </div>

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

            <SectionTitle>
              <span>Herramientas</span>
            </SectionTitle>

            <ServiceSection>
              {services.map((service, index) => (
                <ServiceItem key={index}>
                  {service.icon}
                  <span style={{ marginLeft: "10px" }}>{service.label}</span>
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

            <CreateTaskButton minimized={minimized}>
              {minimized ? (
                <>
                  <PlusCircle size={24} style={{ marginRight: "10px" }} />
                </>
              ) : (
                <>
                  <PlusCircle size={24} style={{ marginRight: "10px" }} />
                  Crear nuevo proyecto
                </>
              )}
            </CreateTaskButton>
          </SidebarContent>
        </SidebarWrapper>
      </AppContainer>
    </>
  );
};

export default SidebarNavigation;
