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

// Support Materials Pages
import SupportMaterials from "./pages/SupportMaterials";
import Tracks from "./pages/Tracks";
import TrackDetail from "./pages/TrackDetail";
import ContentPlayer from "./pages/ContentPlayer";
import MediaLibrary from "./pages/MediaLibrary";
import MediaCategory from "./pages/MediaCategory";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAffiliates from "./pages/admin/AdminAffiliates";
import AdminMyAffiliates from "./pages/admin/AdminMyAffiliates";
import AdminTiers from "./pages/admin/AdminTiers";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminAdmins from "./pages/admin/AdminAdmins";
import AdminSACommissions from "./pages/admin/AdminSACommissions";
import AdminTracks from "./pages/admin/AdminTracks";
import AdminTrackModules from "./pages/admin/AdminTrackModules";
import AdminContents from "./pages/admin/AdminContents";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminMediaItems from "./pages/admin/AdminMediaItems";

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
                
                {/* Support Materials Routes */}
                <Route path="/materials" element={<SupportMaterials />} />
                <Route path="/materials/tracks" element={<Tracks />} />
                <Route path="/materials/tracks/:id" element={<TrackDetail />} />
                <Route path="/materials/tracks/:id/content/:contentId" element={<ContentPlayer />} />
                <Route path="/materials/media" element={<MediaLibrary />} />
                <Route path="/materials/media/:type" element={<MediaLibrary />} />
                <Route path="/materials/media/:type/:categoryId" element={<MediaCategory />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/affiliates" element={<AdminAffiliates />} />
                <Route path="/admin/my-affiliates" element={<AdminMyAffiliates />} />
                <Route path="/admin/tiers" element={<AdminTiers />} />
                <Route path="/admin/pricing" element={<AdminPricing />} />
                <Route path="/admin/support" element={<AdminSupport />} />
                <Route path="/admin/admins" element={<AdminAdmins />} />
                <Route path="/admin/sa-commissions" element={<AdminSACommissions />} />
                <Route path="/admin/tracks" element={<AdminTracks />} />
                <Route path="/admin/tracks/:id/modules" element={<AdminTrackModules />} />
                <Route path="/admin/tracks/:trackId/modules/:moduleId/contents" element={<AdminContents />} />
                <Route path="/admin/media" element={<AdminMedia />} />
                <Route path="/admin/media/items/:categoryId" element={<AdminMediaItems />} />
                
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
