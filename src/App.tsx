import { ProtectedRoute } from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAnalytics } from '@/lib/analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AdminSettings from './pages/admin/AdminSettings';
import AgentsManagement from './pages/admin/AgentsManagement';
import InquiriesManagement from './pages/admin/InquiriesManagement';
import NewsManagement from './pages/admin/NewsManagement';
import PropertiesManagement from './pages/admin/PropertiesManagement';
import Reports from './pages/admin/Reports';
import UsersManagement from './pages/admin/UsersManagement';
import AdminDashboard from './pages/AdminDashboard';
import CreateProperty from './pages/CreateProperty';
import EditProperty from './pages/EditProperty';
import Favorites from './pages/Favorites';
import Index from './pages/Index';
import MyProperties from './pages/MyProperties';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import PropertyDetail from './pages/PropertyDetail';
import Settings from './pages/Settings';
import UserDashboard from './pages/UserDashboard';
import EnvTest from './pages/EnvTest';
import BuySell from './pages/BuySell';
import Rent from './pages/Rent';
import News from './pages/News';
import PostProperty from './pages/PostProperty';

const queryClient = new QueryClient();

const App = () => {
  // 🔥 Auto-track page views for VungTauLand
  useAnalytics('vungtau');

  return (
    <ErrorBoundary>
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
                <Route path="/env-test" element={<EnvTest />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />

                {/* Public Routes */}
                <Route path="/mua-ban" element={<BuySell />} />
                <Route path="/cho-thue" element={<Rent />} />
                <Route path="/tin-tuc" element={<News />} />
                <Route path="/dang-tin" element={<PostProperty />} />

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
    </ErrorBoundary>
  );
};

export default App;
