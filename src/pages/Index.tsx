import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import PropertyList from "@/components/PropertyList";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Building, MapPin, Zap, Search, Phone, CheckCircle2, TrendingUp, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { AuthDialog } from "@/components/Auth/AuthDialog";
import houseImage from "@/assets/property-house.jpg";
import landImage from "@/assets/property-land.jpg";
import apartmentImage from "@/assets/property-apartment.jpg";
import rentalImage from "@/assets/property-rental.jpg";

const Index = () => {
  const { user } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const propertyTypes = [
    {
      title: "Nhà Đất",
      count: "500+",
      icon: Home,
      image: houseImage,
      color: "primary",
    },
    {
      title: "Đất Nền",
      count: "300+",
      icon: MapPin,
      image: landImage,
      color: "secondary",
    },
    {
      title: "Chung Cư",
      count: "150+",
      icon: Building,
      image: apartmentImage,
      color: "accent",
    },
    {
      title: "Cho Thuê",
      count: "200+",
      icon: Zap,
      image: rentalImage,
      color: "primary",
    },
  ];

  const howItWorksSteps = [
    {
      step: 1,
      icon: Search,
      title: "Tìm kiếm",
      description: "Tìm kiếm bất động sản phù hợp với nhu cầu của bạn",
    },
    {
      step: 2,
      icon: Phone,
      title: "Liên hệ",
      description: "Kết nối với môi giới uy tín và chuyên nghiệp",
    },
    {
      step: 3,
      icon: CheckCircle2,
      title: "Hoàn tất",
      description: "Sở hữu ngôi nhà mơ ước của bạn",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="VungTauLand - Bất động sản Vũng Tàu"
        description="Tìm kiếm và mua bán bất động sản tại Vũng Tàu. Villa, căn hộ, nhà phố, đất nền chất lượng với giá tốt nhất."
        keywords="bất động sản vũng tàu, mua nhà vũng tàu, bán nhà vũng tàu, villa, căn hộ, đất nền"
        url="https://vungtauland.com"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Property Listings */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl md:text-4xl font-bold text-foreground">
                Danh Sách Bất Động Sản
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Khám phá những bất động sản tốt nhất tại Vũng Tàu
              </p>
            </div>

            <PropertyList />
          </div>
        </section>

        {/* Property Types */}
        <section className="py-16 md:py-24 bg-muted">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl md:text-4xl font-bold text-foreground">
                Loại Hình Bất Động Sản
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Chọn loại hình phù hợp với nhu cầu của bạn
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {propertyTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.title}
                    className="group relative overflow-hidden rounded-xl bg-card hover-lift cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={type.image}
                        alt={type.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                          <Icon className="h-8 w-8" strokeWidth={2.5} />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold">{type.title}</h3>
                        <p className="text-lg text-white/90">{type.count} tin đăng</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl md:text-4xl font-bold text-foreground">
                Quy Trình Đơn Giản
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Chỉ với 3 bước đơn giản để sở hữu bất động sản mơ ước
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {howItWorksSteps.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="relative text-center">
                    <div className="mb-6 flex justify-center">
                      <div className="relative">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-lighter">
                          <Icon className="h-10 w-10 text-primary" strokeWidth={2.5} />
                        </div>
                        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {item.step}
                        </div>
                      </div>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                    
                    {index < howItWorksSteps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="mb-2 text-4xl md:text-5xl font-bold">1000+</div>
                <div className="text-sm md:text-base text-primary-foreground/90">Bất động sản</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl md:text-5xl font-bold">800+</div>
                <div className="text-sm md:text-base text-primary-foreground/90">Giao dịch thành công</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl md:text-5xl font-bold">500+</div>
                <div className="text-sm md:text-base text-primary-foreground/90">Môi giới uy tín</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl md:text-5xl font-bold">50+</div>
                <div className="text-sm md:text-base text-primary-foreground/90">Quận/Huyện</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-secondary via-primary to-accent relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAgMS4xLS45IDItMiAycy0yLS45LTItMiAuOS0yIDItMiAyIC45IDIgMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
          
          <div className="container relative mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-white tracking-tight">
              Bạn Muốn Đăng Tin?
            </h2>
            <p className="mb-8 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Đăng tin miễn phí, tiếp cận hàng ngàn người mua tiềm năng mỗi ngày
            </p>
            {user ? (
              <Button size="lg" variant="secondary" className="gap-2 text-base font-semibold shadow-xl" asChild>
                <Link to="/my-properties/new">
                  Đăng tin ngay
                  <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                </Link>
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="secondary" 
                className="gap-2 text-base font-semibold shadow-xl"
                onClick={() => setAuthDialogOpen(true)}
              >
                Đăng tin ngay
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </Button>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
};

export default Index;
