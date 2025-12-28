import { Heart, User, Menu, Search, LogIn, Plus, LogOut, Shield, LayoutDashboard, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/Auth/AuthDialog";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2.5">
            <img 
              src="/logo.png" 
              alt="VungTauLand Logo" 
              className="h-11 w-11 rounded-xl shadow-lg"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none tracking-tight" style={{ color: '#0d5c2e' }}>VungTauLand</span>
              <span className="text-[11px] font-medium" style={{ color: '#0d5c2e' }}>BĐS Vũng Tàu</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link to="/mua-ban" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Mua bán
            </Link>
            <Link to="/cho-thue" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Cho thuê
            </Link>
            <Link to="/tin-tuc" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Tin tức
            </Link>
            {user ? (
              <Link to="/dang-tin" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Đăng tin
              </Link>
            ) : (
              <button 
                onClick={() => setAuthDialogOpen(true)} 
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Đăng tin
              </button>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
              <Search className="h-5 w-5" strokeWidth={2} />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
              <Heart className="h-5 w-5" strokeWidth={2} />
            </Button>
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 font-medium">
                      <User className="h-4 w-4" strokeWidth={2.5} />
                      {user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-properties">
                        <FileText className="mr-2 h-4 w-4" />
                        Tin đăng của tôi
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/favorites">
                        <Heart className="mr-2 h-4 w-4" />
                        Yêu thích
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/messages">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Tin nhắn
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary-light font-semibold" asChild>
                  <Link to="/my-properties/new">
                    <Plus className="h-4 w-4" strokeWidth={3} />
                    Đăng tin
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 font-medium"
                  onClick={() => setAuthDialogOpen(true)}
                >
                  <LogIn className="h-4 w-4" strokeWidth={2.5} />
                  Đăng nhập
                </Button>
                <Button 
                  size="sm" 
                  className="gap-2 bg-primary hover:bg-primary-light font-semibold"
                  onClick={() => setAuthDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" strokeWidth={3} />
                  Đăng tin
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-sm font-medium text-foreground hover:text-primary">
                Trang chủ
              </Link>
              <a href="/search" className="text-sm font-medium text-foreground hover:text-primary">
                Mua bán
              </a>
              <a href="/search?type=rent" className="text-sm font-medium text-foreground hover:text-primary">
                Cho thuê
              </a>
              <a href="/news" className="text-sm font-medium text-foreground hover:text-primary">
                Tin tức
              </a>
              {user && (
                <Link to="/dashboard" className="text-sm font-medium text-foreground hover:text-primary">
                  Dashboard
                </Link>
              )}
              {user && (
                <Link to="/my-properties" className="text-sm font-medium text-foreground hover:text-primary">
                  Tin đăng của tôi
                </Link>
              )}
              <div className="flex items-center gap-2 pt-4">
                {user ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => signOut()}>
                      Đăng xuất
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary-light" asChild>
                      <Link to="/my-properties/new">
                        Đăng tin
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setAuthDialogOpen(true)}
                    >
                      Đăng nhập
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-primary hover:bg-primary-light"
                      onClick={() => setAuthDialogOpen(true)}
                    >
                      Đăng tin
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </header>
  );
};

export default Header;
