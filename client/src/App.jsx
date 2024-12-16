import { HashRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "./context/useContext";
import { Toaster } from "sonner";

const queryClient = new QueryClient();
function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" expand={false} richColors />
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </QueryClientProvider>
    </>
  );
}

export default App;
