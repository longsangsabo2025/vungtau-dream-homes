import { Building2, Heart, User, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none text-foreground">VungTauLand</span>
              <span className="text-xs text-muted-foreground">BĐS Vũng Tàu</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Trang chủ
            </a>
            <a href="/search" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Mua bán
            </a>
            <a href="/search?type=rent" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Cho thuê
            </a>
            <a href="/news" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Tin tức
            </a>
            <a href="/post" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Đăng tin
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Đăng nhập
            </Button>
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary-light">
              Đăng tin
            </Button>
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
              <a href="/" className="text-sm font-medium text-foreground hover:text-primary">
                Trang chủ
              </a>
              <a href="/search" className="text-sm font-medium text-foreground hover:text-primary">
                Mua bán
              </a>
              <a href="/search?type=rent" className="text-sm font-medium text-foreground hover:text-primary">
                Cho thuê
              </a>
              <a href="/news" className="text-sm font-medium text-foreground hover:text-primary">
                Tin tức
              </a>
              <a href="/post" className="text-sm font-medium text-foreground hover:text-primary">
                Đăng tin
              </a>
              <div className="flex items-center gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  Đăng nhập
                </Button>
                <Button size="sm" className="flex-1 bg-primary hover:bg-primary-light">
                  Đăng tin
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
