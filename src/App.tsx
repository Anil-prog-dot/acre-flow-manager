import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AppSidebar } from "./components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Harvestor from "./pages/Harvestor";
import Trailer from "./pages/Trailer";
import Expenses from "./pages/Expenses";
import Miscellaneous from "./pages/Miscellaneous";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log("App component is rendering");
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ProtectedRoute>
            <SidebarProvider defaultOpen={false}>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <main className="flex-1 flex flex-col">
                  <header className="h-12 md:h-14 flex items-center border-b bg-background px-4 sticky top-0 z-40">
                    <SidebarTrigger className="touch-target" />
                  </header>
                  <div className="flex-1 p-4 md:p-6 bg-background overflow-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/customers/:id" element={<CustomerDetail />} />
                      <Route path="/harvestor" element={<Harvestor />} />
                      <Route path="/trailer" element={<Trailer />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/miscellaneous" element={<Miscellaneous />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </SidebarProvider>
          </ProtectedRoute>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
