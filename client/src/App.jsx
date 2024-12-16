import { HashRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
const queryClient = new QueryClient();
function App() {
  return (
   
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" reverseOrder={false} />
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </QueryClientProvider>
  
  );
}

export default App;
