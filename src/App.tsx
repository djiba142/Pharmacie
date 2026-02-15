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
import GestionPharmaciePage from "./pages/GestionPharmaciePage";
import GestionHopitalPage from "./pages/GestionHopitalPage";
import GestionCentreSantePage from "./pages/GestionCentreSantePage";
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import ContactPage from "./pages/ContactPage";
import DocumentationPage from "./pages/DocumentationPage";
import MentionsLegalesPage from "./pages/MentionsLegalesPage";
import ConfidentialitePage from "./pages/ConfidentialitePage";
import CGUPage from "./pages/CGUPage";
import CookiesPage from "./pages/CookiesPage";
import FAQPage from "./pages/FAQPage";
import GuidePage from "./pages/GuidePage";
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
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/documentation" element={<DocumentationPage />} />
      <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
      <Route path="/confidentialite" element={<ConfidentialitePage />} />
      <Route path="/cgu" element={<CGUPage />} />
      <Route path="/cookies" element={<CookiesPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/guide" element={<GuidePage />} />
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
        <Route path="/gestion-pharmacie" element={<GestionPharmaciePage />} />
        <Route path="/gestion-hopital" element={<GestionHopitalPage />} />
        <Route path="/gestion-centre-sante" element={<GestionCentreSantePage />} />
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
