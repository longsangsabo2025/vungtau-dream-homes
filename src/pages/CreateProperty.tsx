import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
}

export default function CreateProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    location: '',
    district: '',
    ward: '',
    address_detail: '',
    type: 'Căn hộ',
    category_id: '',
    description: '',
    image_url: '',
    status: 'Có sẵn',
    direction: 'Đông',
    legal_status: 'Sổ đỏ',
    furniture_status: 'Unfurnished',
    parking_slots: '1',
    floor_number: '',
    year_built: '',
  });

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('display_order');
      
      if (data) {
        setCategories(data);
        // Set first category as default
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: data[0].id }));
        }
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.price || !formData.area || !formData.location) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng điền đầy đủ các trường bắt buộc',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Insert property
      const { data, error } = await supabase
        .from('properties')
        .insert({
          title: formData.title,
          price: parseInt(formData.price),
          area: parseInt(formData.area),
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          location: formData.location,
          district: formData.district || null,
          ward: formData.ward || null,
          address_detail: formData.address_detail || null,
          type: formData.type,
          category_id: formData.category_id || null,
          description: formData.description || null,
          image_url: formData.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
          status: formData.status,
          owner_id: user.id,
          direction: formData.direction,
          legal_status: formData.legal_status,
          furniture_status: formData.furniture_status,
          parking_slots: parseInt(formData.parking_slots),
          floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
          year_built: formData.year_built ? parseInt(formData.year_built) : null,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: 'Tin đăng đã được tạo thành công',
      });

      // Redirect to property detail or my properties
      navigate(`/properties/${data.id}`);
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo tin đăng. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link to="/my-properties" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Đăng tin bất động sản mới</CardTitle>
            <CardDescription>
              Điền thông tin chi tiết về bất động sản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
                
                <div>
                  <Label htmlFor="title">Tiêu đề tin đăng *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="VD: Căn hộ 2PN view biển Bãi Trước"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Loại hình *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Căn hộ">Căn hộ</SelectItem>
                        <SelectItem value="Villa">Villa</SelectItem>
                        <SelectItem value="Nhà phố">Nhà phố</SelectItem>
                        <SelectItem value="Đất nền">Đất nền</SelectItem>
                        <SelectItem value="Shophouse">Shophouse</SelectItem>
                        <SelectItem value="Condotel">Condotel</SelectItem>
                        <SelectItem value="Studio">Studio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Danh mục</Label>
                    <Select value={formData.category_id} onValueChange={(value) => handleChange('category_id', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Giá (VNĐ) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      placeholder="5000000000"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="area">Diện tích (m²) *</Label>
                    <Input
                      id="area"
                      type="number"
                      value={formData.area}
                      onChange={(e) => handleChange('area', e.target.value)}
                      placeholder="100"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Có sẵn">Có sẵn</SelectItem>
                        <SelectItem value="Hot">Hot</SelectItem>
                        <SelectItem value="Nổi bật">Nổi bật</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">Số phòng ngủ</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => handleChange('bedrooms', e.target.value)}
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bathrooms">Số phòng tắm</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => handleChange('bathrooms', e.target.value)}
                      placeholder="2"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vị trí</h3>

                <div>
                  <Label htmlFor="location">Địa chỉ tổng quát *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Bãi Trước, Vũng Tàu"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="district">Quận/Huyện</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                      placeholder="Thành phố Vũng Tàu"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ward">Phường/Xã</Label>
                    <Input
                      id="ward"
                      value={formData.ward}
                      onChange={(e) => handleChange('ward', e.target.value)}
                      placeholder="Phường 1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address_detail">Địa chỉ chi tiết</Label>
                  <Input
                    id="address_detail"
                    value={formData.address_detail}
                    onChange={(e) => handleChange('address_detail', e.target.value)}
                    placeholder="123 Đường Trần Phú"
                  />
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thông tin bổ sung</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="direction">Hướng nhà</Label>
                    <Select value={formData.direction} onValueChange={(value) => handleChange('direction', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Đông">Đông</SelectItem>
                        <SelectItem value="Tây">Tây</SelectItem>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Bắc">Bắc</SelectItem>
                        <SelectItem value="Đông Bắc">Đông Bắc</SelectItem>
                        <SelectItem value="Đông Nam">Đông Nam</SelectItem>
                        <SelectItem value="Tây Bắc">Tây Bắc</SelectItem>
                        <SelectItem value="Tây Nam">Tây Nam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="legal_status">Pháp lý</Label>
                    <Select value={formData.legal_status} onValueChange={(value) => handleChange('legal_status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sổ đỏ">Sổ đỏ</SelectItem>
                        <SelectItem value="Sổ hồng">Sổ hồng</SelectItem>
                        <SelectItem value="Hợp đồng mua bán">Hợp đồng mua bán</SelectItem>
                        <SelectItem value="Giấy tờ khác">Giấy tờ khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="furniture_status">Nội thất</Label>
                    <Select value={formData.furniture_status} onValueChange={(value) => handleChange('furniture_status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fully furnished">Đầy đủ nội thất</SelectItem>
                        <SelectItem value="Semi furnished">Một phần nội thất</SelectItem>
                        <SelectItem value="Unfurnished">Chưa có nội thất</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="parking_slots">Chỗ đậu xe</Label>
                    <Input
                      id="parking_slots"
                      type="number"
                      value={formData.parking_slots}
                      onChange={(e) => handleChange('parking_slots', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="floor_number">Tầng số</Label>
                    <Input
                      id="floor_number"
                      type="number"
                      value={formData.floor_number}
                      onChange={(e) => handleChange('floor_number', e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="year_built">Năm xây dựng</Label>
                  <Input
                    id="year_built"
                    type="number"
                    value={formData.year_built}
                    onChange={(e) => handleChange('year_built', e.target.value)}
                    placeholder="2020"
                  />
                </div>
              </div>

              {/* Description & Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mô tả & Hình ảnh</h3>

                <div>
                  <Label htmlFor="description">Mô tả chi tiết</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Mô tả chi tiết về bất động sản..."
                    rows={5}
                  />
                </div>

                <div>
                  <Label htmlFor="image_url">URL Hình ảnh chính</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleChange('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Hoặc <button type="button" className="text-primary hover:underline inline-flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      tải ảnh lên
                    </button> (tính năng sắp có)
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4 border-t">
                <Button type="submit" size="lg" disabled={loading} className="flex-1">
                  {loading ? 'Đang đăng...' : 'Đăng tin'}
                </Button>
                <Link to="/my-properties" className="flex-1">
                  <Button type="button" variant="outline" size="lg" className="w-full">
                    Hủy
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
