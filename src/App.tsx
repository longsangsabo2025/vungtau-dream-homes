import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAnalytics } from "@/lib/analytics";
import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import MyProperties from "./pages/MyProperties";
import CreateProperty from "./pages/CreateProperty";
import EditProperty from "./pages/EditProperty";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PropertiesManagement from "./pages/admin/PropertiesManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import AgentsManagement from "./pages/admin/AgentsManagement";
import NewsManagement from "./pages/admin/NewsManagement";
import InquiriesManagement from "./pages/admin/InquiriesManagement";
import Reports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // 🔥 Auto-track page views for VungTauLand
  useAnalytics("vungtau");
  
  return (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              
              {/* User Routes - Protected (không cần admin) */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-properties" 
                element={
                  <ProtectedRoute>
                    <MyProperties />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-properties/new" 
                element={
                  <ProtectedRoute>
                    <CreateProperty />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-properties/edit/:id" 
                element={
                  <ProtectedRoute>
                    <EditProperty />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/favorites" 
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes - Protected (cần admin) */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/properties" 
                element={
                  <ProtectedRoute requireAdmin>
                    <PropertiesManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requireAdmin>
                    <UsersManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/agents" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AgentsManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/news" 
                element={
                  <ProtectedRoute requireAdmin>
                    <NewsManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/inquiries" 
                element={
                  <ProtectedRoute requireAdmin>
                    <InquiriesManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reports" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSettings />
                  </ProtectedRoute>
                } 
              />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
  );
};

export default App;
