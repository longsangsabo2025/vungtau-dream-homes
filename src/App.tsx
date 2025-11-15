import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import AdminDashboard from "./pages/AdminDashboard";
import PropertyManagement from "./pages/PropertyManagement";
import PropertyForm from "./pages/PropertyForm";
import UserDashboard from "./pages/UserDashboard";
import MyProperties from "./pages/MyProperties";
import CreateProperty from "./pages/CreateProperty";
import EditProperty from "./pages/EditProperty";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
                    <PropertyManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/properties/new" 
                element={
                  <ProtectedRoute requireAdmin>
                    <PropertyForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/properties/edit/:id" 
                element={
                  <ProtectedRoute requireAdmin>
                    <PropertyForm />
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

export default App;
