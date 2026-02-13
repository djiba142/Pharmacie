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
import MedicamentsPage from "./pages/MedicamentsPage";
import CommandesPage from "./pages/CommandesPage";
import LivraisonsPage from "./pages/LivraisonsPage";
import PharmacovigilancePage from "./pages/PharmacovigilancePage";
import RapportsPage from "./pages/RapportsPage";
import UsersPage from "./pages/UsersPage";
import ParametresPage from "./pages/ParametresPage";
import ProfilPage from "./pages/ProfilPage";
import AProposPage from "./pages/AProposPage";
import ValidationInscriptionsPage from "./pages/ValidationInscriptionsPage";
import DemandeInscriptionPage from "./pages/DemandeInscriptionPage";
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
      <Route path="/inscription" element={<DemandeInscriptionPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/stocks" element={<StocksPage />} />
        <Route path="/medicaments" element={<MedicamentsPage />} />
        <Route path="/commandes" element={<CommandesPage />} />
        <Route path="/livraisons" element={<LivraisonsPage />} />
        <Route path="/pharmacovigilance" element={<PharmacovigilancePage />} />
        <Route path="/rapports" element={<RapportsPage />} />
        <Route path="/utilisateurs" element={<UsersPage />} />
        <Route path="/validation-inscriptions" element={<ValidationInscriptionsPage />} />
        <Route path="/parametres" element={<ParametresPage />} />
        <Route path="/profil" element={<ProfilPage />} />
        <Route path="/a-propos" element={<AProposPage />} />
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
