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
  Settings as SettingsIcon,
  Slack,
  Trello,
  Zap,
  NotebookIcon,
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
} from "../style/navbar";
import { Link } from "react-router-dom";
const SidebarNavigation = ({ minimized, toggleSidebar }) => {
  //const [minimized, setMinimized] = useState(false);
  const [activeItem, setActiveItem] = useState("project");

  const menuItems = [
    {
      icon: <Layout size={20} />,
      label: "Inicio",
      key: "inicio",
    },
    {
      icon: <Trello size={20} />,
      label: "Materias",
      key: "materias",
    },
    {
      icon: <Calendar size={20} />,
      label: "Proyectos",
      key: "proyectos",
      extra: "+",
    },
    {
      icon: <Mail size={20} />,
      label: "Colaboraciones",
      key: "colaboraciones",
      badge: 4,
    },
    {
      icon: <Bell size={20} />,
      label: "Notifications",
      key: "notifications",
    },
    {
      icon: <Layout size={20} />,
      label: "Pizarra",
      key: "pizarra",
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
              <User
                size={50}
                color={colors.text.light}
                style={{ marginRight: "15px" }}
              />
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
              <User
                size={50}
                color={colors.text.light}
                style={{ marginRight: "15px" }}
              />
              <div>
                <div style={{ color: colors.text.light, fontSize: "0.9em" }}>
                  Buenos dias 👋
                </div>
                <div style={{ fontWeight: "bold", color: colors.text.dark }}>
                  Rossana angela
                </div>
              </div>
            </ProfileSection>

            <SectionTitle>
              <span>Menu</span>
            </SectionTitle>

            {menuItems.map((item) => (
              <Link
                key={item.key}
                to={`/${item.key}`}
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
