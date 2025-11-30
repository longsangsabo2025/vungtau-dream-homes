import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyList from "@/components/PropertyList";
import { SEO } from "@/components/SEO";
import { Home, DollarSign, FileCheck, Clock } from "lucide-react";

const Rent = () => {
  const features = [
    {
      icon: Home,
      title: "Đa dạng lựa chọn",
      description: "Nhà nguyên căn, chung cư, phòng trọ...",
    },
    {
      icon: DollarSign,
      title: "Giá thuê linh hoạt",
      description: "Từ 3 triệu - 100 triệu/tháng",
    },
    {
      icon: FileCheck,
      title: "Hợp đồng rõ ràng",
      description: "Thủ tục đơn giản, pháp lý đầy đủ",
    },
    {
      icon: Clock,
      title: "Dễ dàng thuê nhanh",
      description: "Liên hệ trực tiếp với chủ nhà",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Cho thuê nhà đất Vũng Tàu - VungTauLand"
        description="Tìm nhà cho thuê, căn hộ cho thuê, phòng trọ tại Vũng Tàu. Giá tốt, vị trí đẹp, cập nhật liên tục."
        keywords="cho thuê nhà vũng tàu, thuê căn hộ vũng tàu, phòng trọ vũng tàu, homestay vũng tàu"
        url="https://vungtauland.com/cho-thue"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-secondary/10 via-accent/5 to-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
                Cho Thuê Bất Động Sản
                <span className="block text-secondary mt-2">Tại Vũng Tàu</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Tìm nhà cho thuê phù hợp với ngân sách và nhu cầu của bạn
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
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-secondary mb-4">
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
                Danh Sách Nhà Cho Thuê
              </h2>
              <p className="text-lg text-muted-foreground">
                Tìm kiếm nhà cho thuê phù hợp với bạn
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

export default Rent;
