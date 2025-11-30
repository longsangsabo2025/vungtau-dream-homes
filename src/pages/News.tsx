import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, ArrowRight, Search, TrendingUp, Clock } from "lucide-react";
import { useState } from "react";

// Mock data - Sau này sẽ lấy từ Supabase
const mockNews = [
  {
    id: "1",
    title: "Thị trường BĐS Vũng Tàu quý 4/2025: Xu hướng tăng giá nhẹ",
    excerpt: "Theo báo cáo mới nhất, thị trường bất động sản Vũng Tàu ghi nhận mức tăng giá nhẹ 3-5% so với quý trước...",
    category: "Thị trường",
    author: "Nguyễn Văn A",
    published_at: "2025-11-20",
    image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    is_featured: true,
  },
  {
    id: "2",
    title: "5 Dự án căn hộ đáng chú ý tại Vũng Tàu năm 2025",
    excerpt: "Khám phá những dự án căn hộ cao cấp với vị trí đắc địa và tiện ích hiện đại nhất tại thành phố biển...",
    category: "Dự án",
    author: "Trần Thị B",
    published_at: "2025-11-18",
    image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    is_featured: true,
  },
  {
    id: "3",
    title: "Hướng dẫn đầu tư đất nền tại Vũng Tàu cho người mới",
    excerpt: "Những lưu ý quan trọng khi đầu tư đất nền tại Vũng Tàu để tránh rủi ro và tối đa hóa lợi nhuận...",
    category: "Đầu tư",
    author: "Lê Văn C",
    published_at: "2025-11-15",
    image_url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800",
    is_featured: false,
  },
  {
    id: "4",
    title: "Giá thuê villa tại Vũng Tàu tăng mạnh dịp cuối năm",
    excerpt: "Nhu cầu thuê villa nghỉ dưỡng tăng cao khiến giá thuê tại các khu vực ven biển tăng 20-30%...",
    category: "Thị trường",
    author: "Phạm Thị D",
    published_at: "2025-11-12",
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    is_featured: false,
  },
  {
    id: "5",
    title: "Chính sách mới về thuế bất động sản năm 2026",
    excerpt: "Cập nhật những thay đổi quan trọng trong chính sách thuế BĐS có hiệu lực từ đầu năm 2026...",
    category: "Chính sách",
    author: "Hoàng Văn E",
    published_at: "2025-11-10",
    image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
    is_featured: false,
  },
  {
    id: "6",
    title: "Top 10 khu đô thị mới đáng sống nhất Vũng Tàu",
    excerpt: "Điểm danh những khu đô thị mới với hạ tầng hoàn thiện và môi trường sống lý tưởng...",
    category: "Dự án",
    author: "Nguyễn Thị F",
    published_at: "2025-11-08",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    is_featured: false,
  },
];

const News = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading] = useState(false);

  const categories = ["Tất cả", "Thị trường", "Dự án", "Đầu tư", "Chính sách", "Phong thủy"];

  const filteredNews = mockNews.filter((news) => {
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         news.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           news.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const featuredNews = filteredNews.filter((news) => news.is_featured);
  const regularNews = filteredNews.filter((news) => !news.is_featured);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Tin tức bất động sản Vũng Tàu - VungTauLand"
        description="Cập nhật tin tức mới nhất về thị trường BĐS Vũng Tàu, dự án mới, chính sách, xu hướng đầu tư..."
        keywords="tin tức bds vũng tàu, thị trường bds vũng tàu, dự án vũng tàu, đầu tư vũng tàu"
        url="https://vungtauland.com/tin-tuc"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
                Tin Tức Bất Động Sản
                <span className="block text-accent mt-2">Vũng Tàu</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Cập nhật thông tin mới nhất về thị trường, dự án và chính sách BĐS
              </p>

              {/* Search */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm tin tức..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === (category === "Tất cả" ? "all" : category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category === "Tất cả" ? "all" : category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <section className="py-16 bg-muted">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-8">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Tin Nổi Bật
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredNews.map((news) => (
                  <article
                    key={news.id}
                    className="group relative overflow-hidden rounded-xl bg-card border hover-lift cursor-pointer"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={news.image_url}
                        alt={news.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <Badge className="mb-3">{news.category}</Badge>
                      <h3 className="text-xl font-bold mb-3 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {news.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{news.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(news.published_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Regular News */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Tin Mới Nhất
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[16/9] w-full rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : regularNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularNews.map((news) => (
                  <article
                    key={news.id}
                    className="group relative overflow-hidden rounded-xl bg-card border hover-lift cursor-pointer"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={news.image_url}
                        alt={news.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <Badge variant="secondary" className="mb-3">
                        {news.category}
                      </Badge>
                      <h3 className="text-lg font-bold mb-3 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {news.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5" />
                          <span>{news.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(news.published_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Không tìm thấy tin tức phù hợp
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default News;
