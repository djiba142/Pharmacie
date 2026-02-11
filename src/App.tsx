import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StocksPage from "./pages/StocksPage";
import CommandesPage from "./pages/CommandesPage";
import LivraisonsPage from "./pages/LivraisonsPage";
import UsersPage from "./pages/UsersPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient();

function AppContent() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/stocks" element={<StocksPage />} />
        <Route path="/medicaments" element={<PlaceholderPage />} />
        <Route path="/commandes" element={<CommandesPage />} />
        <Route path="/livraisons" element={<LivraisonsPage />} />
        <Route path="/pharmacovigilance" element={<PlaceholderPage />} />
        <Route path="/rapports" element={<PlaceholderPage />} />
        <Route path="/utilisateurs" element={<UsersPage />} />
        <Route path="/parametres" element={<PlaceholderPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
