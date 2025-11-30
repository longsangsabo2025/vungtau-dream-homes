import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, MapPin, DollarSign, Home, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/Auth/AuthDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PostProperty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    status: "Có sẵn",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    location: "",
    address: "",
    description: "",
    image_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }

    setLoading(true);
    
    // TODO: Integrate with Supabase
    setTimeout(() => {
      setLoading(false);
      toast.success("Đăng tin thành công! Tin của bạn đang chờ duyệt.");
      navigate("/my-properties");
    }, 2000);
  };

  const benefits = [
    {
      icon: Upload,
      title: "Đăng tin dễ dàng",
      description: "Chỉ cần 3 phút để hoàn tất",
    },
    {
      icon: CheckCircle2,
      title: "Miễn phí 100%",
      description: "Không mất bất kỳ chi phí nào",
    },
    {
      icon: MapPin,
      title: "Tiếp cận khách hàng",
      description: "Hàng nghìn người truy cập mỗi ngày",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Đăng tin bất động sản miễn phí - VungTauLand"
        description="Đăng tin mua bán, cho thuê bất động sản tại Vũng Tàu hoàn toàn miễn phí. Tiếp cận hàng nghìn khách hàng tiềm năng."
        keywords="đăng tin bds vũng tàu, đăng tin miễn phí, bán nhà vũng tàu, cho thuê nhà vũng tàu"
        url="https://vungtauland.com/dang-tin"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
                Đăng Tin Bất Động Sản
                <span className="block text-primary mt-2">Miễn Phí 100%</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Đăng tin mua bán, cho thuê nhanh chóng và tiếp cận hàng nghìn khách hàng
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className="flex flex-col items-center text-center p-6 rounded-xl bg-card border"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary mb-3">
                      <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-base font-semibold mb-1 text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card border rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  Thông Tin Bất Động Sản
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Tiêu đề tin đăng <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="VD: Bán villa view biển 3 tầng tại Vũng Tàu"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* Type & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-medium">
                        Loại hình <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                        required
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Chọn loại hình" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Villa">Villa</SelectItem>
                          <SelectItem value="Căn hộ">Căn hộ</SelectItem>
                          <SelectItem value="Nhà phố">Nhà phố</SelectItem>
                          <SelectItem value="Đất nền">Đất nền</SelectItem>
                          <SelectItem value="Biệt thự">Biệt thự</SelectItem>
                          <SelectItem value="Shophouse">Shophouse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">
                        Trạng thái <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                        required
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Có sẵn">Có sẵn</SelectItem>
                          <SelectItem value="Hot">Hot</SelectItem>
                          <SelectItem value="Nổi bật">Nổi bật</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Price & Area */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Giá (VNĐ) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="VD: 5000000000"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-sm font-medium flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Diện tích (m²) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="area"
                        type="number"
                        placeholder="VD: 150"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Bedrooms & Bathrooms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms" className="text-sm font-medium">
                        Số phòng ngủ
                      </Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        placeholder="VD: 3"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms" className="text-sm font-medium">
                        Số phòng tắm
                      </Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        placeholder="VD: 2"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Khu vực <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="location"
                      placeholder="VD: Thùy Vân, Vũng Tàu"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Địa chỉ chi tiết
                    </Label>
                    <Input
                      id="address"
                      placeholder="VD: 123 Đường Thùy Vân, Phường 2"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Mô tả chi tiết <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả chi tiết về bất động sản của bạn..."
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  {/* Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="image_url" className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Link hình ảnh <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="image_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Bạn có thể upload ảnh lên Imgur hoặc sử dụng link ảnh từ internet
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full font-semibold"
                      disabled={loading}
                    >
                      {loading ? "Đang đăng tin..." : "Đăng tin ngay"}
                    </Button>
                    {!user && (
                      <p className="text-sm text-center text-muted-foreground mt-3">
                        Bạn cần đăng nhập để đăng tin
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
};

export default PostProperty;
