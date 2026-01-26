import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ThemeProvider } from "@/hooks/useTheme";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Leads from "./pages/Leads";
import Payouts from "./pages/Payouts";
import Settings from "./pages/Settings";
import Commissions from "./pages/Commissions";
import Reports from "./pages/Reports";
import Documents from "./pages/Documents";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAffiliates from "./pages/admin/AdminAffiliates";
import AdminTiers from "./pages/admin/AdminTiers";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminAdmins from "./pages/admin/AdminAdmins";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Affiliate Routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/payouts" element={<Payouts />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/commissions" element={<Commissions />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/support" element={<Support />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/affiliates" element={<AdminAffiliates />} />
                <Route path="/admin/tiers" element={<AdminTiers />} />
                <Route path="/admin/pricing" element={<AdminPricing />} />
                <Route path="/admin/support" element={<AdminSupport />} />
                <Route path="/admin/admins" element={<AdminAdmins />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
