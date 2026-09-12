import { useEffect, useState } from "react";
import SidebarNavigation from "../../components/sidebar";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { Toaster } from "sonner";

const temaLayout = {
  colors: {
    primary: "#007BFF",
    secondary: "#6C757D",
    background: "#F8F9FA",
    content: "#F8F9FA",
    text: {
      light: "#FFFFFF",
      dark: "#212529",
    },
  },
};

const Layout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(
    () => typeof window === "undefined" || window.innerWidth > 768,
  );

  useEffect(() => {
    const consultaMovil = window.matchMedia("(max-width: 768px)");
    const contraerEnMovil = (evento) => {
      if (evento.matches) setIsSidebarExpanded(false);
    };

    consultaMovil.addEventListener("change", contraerEnMovil);
    return () => consultaMovil.removeEventListener("change", contraerEnMovil);
  }, []);

  return (
    <Container theme={temaLayout}>
      <SidebarWrapper $isExpanded={isSidebarExpanded} theme={temaLayout}>
        <SidebarNavigation
          minimized={!isSidebarExpanded}
          toggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        />
      </SidebarWrapper>

      <ContentWrapper theme={temaLayout}>
        <Outlet />
      </ContentWrapper>

      <Toaster richColors position="top-right" />
    </Container>
  );
};

export default Layout;

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background || "#f8f9fa"};
`;

const SidebarWrapper = styled.aside`
  flex: 0 0 auto;
  height: 100dvh;
  overflow: ${({ $isExpanded }) => ($isExpanded ? "hidden" : "visible")};
  transition: width 0.3s ease;
  background-color: ${({ theme }) => theme.colors.sidebar || "#ffffff"};
`;

const ContentWrapper = styled.main`
  flex: 1;
  min-width: 0;
  height: 100dvh;
  padding: 16px;
  transition: margin-left 0.3s ease;
  background-color: ${({ theme }) => theme.colors.content || "#f8f9fa"};

  overflow-y: auto;
  overflow-x: hidden;

  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: transparent;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;
