import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyList from "@/components/PropertyList";
import { SEO } from "@/components/SEO";
import { Building2, TrendingUp, Shield, Zap } from "lucide-react";

const BuySell = () => {
  const features = [
    {
      icon: Building2,
      title: "Đa dạng loại hình",
      description: "Nhà phố, villa, đất nền, chung cư...",
    },
    {
      icon: TrendingUp,
      title: "Giá cạnh tranh",
      description: "Cập nhật giá thị trường liên tục",
    },
    {
      icon: Shield,
      title: "Pháp lý rõ ràng",
      description: "Sổ đỏ chính chủ, thủ tục minh bạch",
    },
    {
      icon: Zap,
      title: "Giao dịch nhanh",
      description: "Hỗ trợ vay ngân hàng, sang tên nhanh",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Mua Bán Nhà Đất Vũng Tàu - Villa, Căn Hộ, Đất Nền Uy Tín | VungTauLand"
        description="🏡 Mua bán bất động sản Vũng Tàu uy tín. Villa mặt biển, căn hộ cao cấp, đất nền sổ hồng từ 1-50 tỷ. Pháp lý rõ ràng, hỗ trợ vay ngân hàng. Hotline: 0977.888.999"
        keywords="mua nhà vũng tàu, bán nhà vũng tàu, đất nền vũng tàu, villa vũng tàu, căn hộ vũng tàu, bất động sản vũng tàu, sổ hồng vũng tàu, nhà mặt biển vũng tàu"
        url="https://vungtauland.store/mua-ban"
        canonical="https://vungtauland.store/mua-ban"
        type="website"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
                Mua Bán Bất Động Sản
                <span className="block text-primary mt-2">Tại Vũng Tàu</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Khám phá hàng trăm bất động sản chất lượng với giá cạnh tranh nhất thị trường
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="flex flex-col items-center text-center p-6 rounded-xl bg-card border hover-lift"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary mb-4">
                      <Icon className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Property Listings */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Danh Sách Bất Động Sản Bán
              </h2>
              <p className="text-lg text-muted-foreground">
                Tìm kiếm và lọc theo nhu cầu của bạn
              </p>
            </div>

            <PropertyList />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BuySell;
