import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  LayoutDashboard,
  FileText,
  Heart,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  description: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Tổng quan thống kê',
  },
  {
    title: 'Tin đăng của tôi',
    href: '/my-properties',
    icon: FileText,
    description: 'Quản lý tin đăng',
  },
  {
    title: 'Yêu thích',
    href: '/favorites',
    icon: Heart,
    description: 'BĐS đã lưu',
  },
  {
    title: 'Tin nhắn',
    href: '/messages',
    icon: MessageSquare,
    description: 'Hội thoại',
  },
  {
    title: 'Tài khoản',
    href: '/profile',
    icon: User,
    description: 'Thông tin cá nhân',
  },
  {
    title: 'Cài đặt',
    href: '/settings',
    icon: Settings,
    description: 'Tùy chỉnh',
  },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-white border-r transition-all duration-300 z-40',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-4">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">VungTauLand</span>
                <span className="text-xs text-muted-foreground">User Panel</span>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                title={!sidebarOpen ? item.title : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs opacity-70 truncate">
                      {item.description}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-2 bg-white">
          {sidebarOpen && (
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Chuyển đổi
            </p>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1',
                'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 hover:from-purple-100 hover:to-pink-100',
                'dark:from-purple-950 dark:to-pink-950 dark:text-purple-300 dark:hover:from-purple-900 dark:hover:to-pink-900',
                'border border-purple-200 dark:border-purple-800'
              )}
              title={!sidebarOpen ? 'Chuyển sang giao diện Admin' : undefined}
            >
              <Shield className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <div className="flex items-center justify-between flex-1">
                  <span className="font-semibold">Giao diện Admin</span>
                  <Badge variant="secondary" className="text-xs bg-purple-700 text-white">
                    Chuyển
                  </Badge>
                </div>
              )}
            </Link>
          )}

          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title={!sidebarOpen ? 'Về trang chủ' : undefined}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Về trang chủ</span>}
          </Link>

          {sidebarOpen && user && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-muted">
              <p className="text-xs font-medium truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">User Account</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        {children}
      </main>
    </div>
  );
}
