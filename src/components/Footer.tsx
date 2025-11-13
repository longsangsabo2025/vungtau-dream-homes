import { Building, Mail, Phone, MapPin, Facebook, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary shadow-lg">
                <Building className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none tracking-tight">VungTauLand</span>
                <span className="text-[11px] text-muted-foreground font-medium">BĐS Vũng Tàu</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Nền tảng bất động sản uy tín tại Vũng Tàu. Kết nối người mua, người bán và môi giới chuyên nghiệp.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary-light transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-3">
              <li>
                <a href="/search" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Mua bán nhà đất
                </a>
              </li>
              <li>
                <a href="/search?type=rent" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cho thuê
                </a>
              </li>
              <li>
                <a href="/news" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tin tức BĐS
                </a>
              </li>
              <li>
                <a href="/post" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Đăng tin miễn phí
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Hướng dẫn đăng tin
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Quy định đăng tin
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <span className="text-sm text-muted-foreground">
                  123 Đường Trương Công Định, Phường 1, Vũng Tàu
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" strokeWidth={2.5} />
                <a href="tel:0254123456" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  0254 123 456
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" strokeWidth={2.5} />
                <a href="mailto:contact@vungtauland.vn" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  contact@vungtauland.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2024 VungTauLand. Bản quyền thuộc về Công ty Bất Động Sản Vũng Tàu.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Điều khoản dịch vụ
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Chính sách bảo mật
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
