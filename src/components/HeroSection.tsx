import { Search, MapPin, Home, BadgeDollarSign, Maximize2, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import heroImage from "@/assets/hero-vungtau.jpg";

const HeroSection = () => {
  const propertyTypes = [
    { value: "all", label: "Tất cả" },
    { value: "house", label: "Nhà" },
    { value: "land", label: "Đất" },
    { value: "apartment", label: "Chung cư" },
    { value: "rental", label: "Cho thuê" },
  ];

  const districts = [
    { value: "all", label: "Tất cả quận/huyện" },
    { value: "tp-vungtau", label: "TP. Vũng Tàu" },
    { value: "phu-my", label: "TX. Phú Mỹ" },
    { value: "chau-duc", label: "H. Châu Đức" },
    { value: "xuyen-moc", label: "H. Xuyên Mộc" },
    { value: "long-dien", label: "H. Long Điền" },
    { value: "dat-do", label: "H. Đất Đỏ" },
  ];

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Vũng Tàu Beach and Cityscape"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-hero-overlay/90 via-hero-overlay/70 to-hero-overlay/50" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl">
          {/* Heading */}
          <div className="mb-8 animate-fade-in">
            <h1 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
              Tìm Ngôi Nhà Mơ Ước Của Bạn Tại Vũng Tàu
            </h1>
            <p className="text-lg md:text-xl text-white/90 text-balance">
              Khám phá hàng nghìn bất động sản uy tín, giá tốt nhất thị trường
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl animate-slide-up">
            {/* Property Type Buttons */}
            <div className="mb-4 flex flex-wrap gap-2">
              {propertyTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={type.value === "all" ? "default" : "outline"}
                  size="sm"
                  className={type.value === "all" ? "bg-primary hover:bg-primary-light" : ""}
                >
                  {type.label}
                </Button>
              ))}
            </div>

            {/* Search Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" strokeWidth={2.5} />
                <Select defaultValue="all">
                  <SelectTrigger className="pl-10 h-12">
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.value} value={district.value}>
                        {district.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="relative">
                <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" strokeWidth={2.5} />
                <Select>
                  <SelectTrigger className="pl-10 h-12">
                    <SelectValue placeholder="Khoảng giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-2">{"< 2 tỷ"}</SelectItem>
                    <SelectItem value="2-5">2 - 5 tỷ</SelectItem>
                    <SelectItem value="5-10">5 - 10 tỷ</SelectItem>
                    <SelectItem value="10-plus">{"> 10 tỷ"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Area */}
              <div className="relative">
                <Maximize2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" strokeWidth={2.5} />
                <Select>
                  <SelectTrigger className="pl-10 h-12">
                    <SelectValue placeholder="Diện tích" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-50">{"< 50 m²"}</SelectItem>
                    <SelectItem value="50-100">50 - 100 m²</SelectItem>
                    <SelectItem value="100-200">100 - 200 m²</SelectItem>
                    <SelectItem value="200-plus">{"> 200 m²"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bedrooms */}
              <div className="relative">
                <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" strokeWidth={2.5} />
                <Select>
                  <SelectTrigger className="pl-10 h-12">
                    <SelectValue placeholder="Phòng ngủ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1+ phòng</SelectItem>
                    <SelectItem value="2">2+ phòng</SelectItem>
                    <SelectItem value="3">3+ phòng</SelectItem>
                    <SelectItem value="4">4+ phòng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Button */}
            <Button size="lg" className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary-light shadow-lg">
              <Search className="mr-2 h-5 w-5" strokeWidth={2.5} />
              Tìm kiếm bất động sản
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap items-center gap-6 text-white/90 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">1000+ Bất động sản</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-secondary" />
              <span className="text-sm font-medium">500+ Môi giới</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-sm font-medium">50+ Quận/Huyện</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
