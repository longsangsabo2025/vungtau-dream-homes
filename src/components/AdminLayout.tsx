import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Settings, 
  BarChart3,
  MessageSquare,
  Shield,
  Home,
  ChevronLeft,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Tổng quan hệ thống'
  },
  {
    name: 'Quản lý BĐS',
    href: '/admin/properties',
    icon: Building2,
    description: 'Danh sách tin đăng'
  },
  {
    name: 'Người dùng',
    href: '/admin/users',
    icon: Users,
    description: 'Quản lý users'
  },
  {
    name: 'Agents',
    href: '/admin/agents',
    icon: Shield,
    description: 'Quản lý agents'
  },
  {
    name: 'Tin tức',
    href: '/admin/news',
    icon: FileText,
    description: 'Quản lý tin tức'
  },
  {
    name: 'Yêu cầu',
    href: '/admin/inquiries',
    icon: MessageSquare,
    description: 'Yêu cầu tư vấn'
  },
  {
    name: 'Báo cáo',
    href: '/admin/reports',
    icon: BarChart3,
    description: 'Thống kê & báo cáo'
  },
  {
    name: 'Cài đặt',
    href: '/admin/settings',
    icon: Settings,
    description: 'Cấu hình hệ thống'
  },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex h-full flex-col border-r bg-background">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            {sidebarOpen ? (
              <>
                <Link to="/admin" className="flex items-center space-x-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                    <Shield className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Admin Panel</span>
                    <span className="text-xs text-muted-foreground">VungTauLand</span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="h-8 w-8"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <div className="flex flex-col flex-1 min-w-0">
                      <span>{item.name}</span>
                      <span className="text-xs opacity-70 truncate">
                        {item.description}
                      </span>
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-2 space-y-1">
            {sidebarOpen && (
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Chuyển đổi
              </p>
            )}
            
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 hover:from-blue-100 hover:to-cyan-100",
                "dark:from-blue-950 dark:to-cyan-950 dark:text-blue-300 dark:hover:from-blue-900 dark:hover:to-cyan-900",
                "border border-blue-200 dark:border-blue-800"
              )}
              title={!sidebarOpen ? "Chuyển sang giao diện User" : undefined}
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <div className="flex items-center justify-between flex-1">
                  <span className="font-semibold">Giao diện User</span>
                  <Badge variant="secondary" className="text-xs bg-blue-700 text-white">
                    Chuyển
                  </Badge>
                </div>
              )}
            </Link>
            
            <Link
              to="/"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={!sidebarOpen ? "Về trang chủ" : undefined}
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>Về trang chủ</span>}
            </Link>
            
            {sidebarOpen && (
              <div className="mt-2 px-3 py-2">
                <p className="text-xs text-muted-foreground mb-1">Đăng nhập với</p>
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => signOut()}
                >
                  Đăng xuất
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <h1 className="text-xl font-semibold">
            {navigation.find(item => item.href === location.pathname)?.name || 'Admin'}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
