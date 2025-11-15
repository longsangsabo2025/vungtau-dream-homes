import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Save } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface PropertyFormData {
  title: string;
  type: string;
  price: string;
  location: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  description: string;
  status: string;
  image_url: string;
}

const PropertyForm = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    type: "Nhà Đất",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
    status: "Có sẵn",
    image_url: "",
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }

    if (isEditing) {
      fetchProperty();
    }
  }, [isAdmin, navigate, isEditing]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title,
        type: data.type,
        price: data.price.toString(),
        location: data.location,
        bedrooms: data.bedrooms?.toString() || "",
        bathrooms: data.bathrooms?.toString() || "",
        area: data.area.toString(),
        description: data.description || "",
        status: data.status,
        image_url: data.image_url,
      });
    } catch (error) {
      console.error("Error fetching property:", error);
      toast.error("Không thể tải thông tin bất động sản");
      navigate("/admin/properties");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const propertyData = {
        title: formData.title,
        type: formData.type,
        price: parseInt(formData.price),
        location: formData.location,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area: parseInt(formData.area),
        description: formData.description,
        status: formData.status,
        image_url: formData.image_url,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Cập nhật bất động sản thành công!");
      } else {
        const { error } = await supabase
          .from("properties")
          .insert([propertyData]);

        if (error) throw error;
        toast.success("Thêm bất động sản thành công!");
      }

      navigate("/admin/properties");
    } catch (error) {
      console.error("Error saving property:", error);
      toast.error("Không thể lưu bất động sản");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof PropertyFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Link to="/admin/properties">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? "Chỉnh sửa" : "Thêm"} Bất Động Sản
              </h1>
              <p className="text-gray-600 mt-1">
                Điền thông tin chi tiết về bất động sản
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="VD: Villa 3 phòng ngủ view biển Vũng Tàu"
                  />
                </div>

                {/* Type & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Loại BĐS *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleChange("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nhà Đất">Nhà Đất</SelectItem>
                        <SelectItem value="Chung Cư">Chung Cư</SelectItem>
                        <SelectItem value="Đất Nền">Đất Nền</SelectItem>
                        <SelectItem value="Cho Thuê">Cho Thuê</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Có sẵn">Có sẵn</SelectItem>
                        <SelectItem value="Đã bán">Đã bán</SelectItem>
                        <SelectItem value="Đang thương lượng">Đang thương lượng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price & Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Giá (VNĐ) *</Label>
                    <Input
                      id="price"
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      placeholder="15000000000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Diện tích (m²) *</Label>
                    <Input
                      id="area"
                      type="number"
                      required
                      value={formData.area}
                      onChange={(e) => handleChange("area", e.target.value)}
                      placeholder="150"
                    />
                  </div>
                </div>

                {/* Bedrooms & Bathrooms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Số phòng ngủ</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => handleChange("bedrooms", e.target.value)}
                      placeholder="3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Số phòng tắm</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => handleChange("bathrooms", e.target.value)}
                      placeholder="2"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm *</Label>
                  <Input
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="VD: Phường Thắng Tam, Vũng Tàu"
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="image_url">URL Hình ảnh *</Label>
                  <Input
                    id="image_url"
                    type="url"
                    required
                    value={formData.image_url}
                    onChange={(e) => handleChange("image_url", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="mt-2 h-48 w-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Mô tả chi tiết về bất động sản..."
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-4">
              <Link to="/admin/properties">
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {loading ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyForm;
