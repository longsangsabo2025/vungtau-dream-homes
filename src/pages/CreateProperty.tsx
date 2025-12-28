import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { CurrencyInput } from '../components/ui/currency-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, Image as ImageIcon, MapPin, Trash2, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import ImageUpload from '../components/ImageUpload';
import MapPicker from '../components/MapPicker';

interface Category {
  id: string;
  name: string;
}

const DRAFT_KEY = 'vungtauland_property_draft';

// Helper to load draft from localStorage
const loadDraft = () => {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading draft:', e);
  }
  return null;
};

// Helper to save draft to localStorage
const saveDraft = (data: Record<string, unknown>, images: string[]) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: data, images, savedAt: new Date().toISOString() }));
  } catch (e) {
    console.error('Error saving draft:', e);
  }
};

// Helper to clear draft
const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (e) {
    console.error('Error clearing draft:', e);
  }
};

export default function CreateProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [hasDraft, setHasDraft] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    location: '',
    district: 'Thành phố Vũng Tàu',
    ward: '',
    address_detail: '',
    type: 'Bán',
    category_id: '',
    description: '',
    status: 'available',
    direction: 'Đông',
    legal_status: 'Sổ đỏ',
    furniture_status: 'Unfurnished',
    parking_slots: '1',
    floor_number: '',
    year_built: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.formData) {
      setFormData(prev => ({ ...prev, ...draft.formData }));
      if (draft.images && draft.images.length > 0) {
        setImages(draft.images);
      }
      setHasDraft(true);
      toast({
        title: 'Đã khôi phục bản nháp',
        description: `Lưu lúc: ${new Date(draft.savedAt).toLocaleString('vi-VN')}`,
      });
    }
  }, []);

  // Auto-save draft when form changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.price || formData.description || images.length > 0) {
        saveDraft(formData, images);
        setHasDraft(true);
      }
    }, 1000); // Debounce 1 second
    
    return () => clearTimeout(timer);
  }, [formData, images]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('display_order');
      
      if (data) {
        setCategories(data);
        // Set first category as default if not loaded from draft
        if (data.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: data[0].id }));
        }
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClearDraft = () => {
    clearDraft();
    setHasDraft(false);
    setFormData({
      title: '',
      price: '',
      area: '',
      bedrooms: '',
      bathrooms: '',
      location: '',
      district: 'Thành phố Vũng Tàu',
      ward: '',
      address_detail: '',
      type: 'Bán',
      category_id: categories.length > 0 ? categories[0].id : '',
      description: '',
      status: 'available',
      direction: 'Đông',
      legal_status: 'Sổ đỏ',
      furniture_status: 'Unfurnished',
      parking_slots: '1',
      floor_number: '',
      year_built: '',
      latitude: null,
      longitude: null,
    });
    setImages([]);
    toast({
      title: 'Đã xóa bản nháp',
      description: 'Form đã được làm mới',
    });
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

      if (images.length === 0) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng tải lên ít nhất một hình ảnh',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Insert property with pending approval status
      const { data, error } = await supabase
        .from('properties')
        .insert({
          title: formData.title,
          price: parseInt(formData.price.replace(/\./g, '')),
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
          image_url: images[0] || null,
          status: formData.status,
          owner_id: user.id,
          direction: formData.direction,
          legal_status: formData.legal_status,
          furniture_status: formData.furniture_status,
          parking_slots: parseInt(formData.parking_slots),
          floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
          year_built: formData.year_built ? parseInt(formData.year_built) : null,
          latitude: formData.latitude,
          longitude: formData.longitude,
          approval_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Save additional images to property_images table
      if (data && images.length > 0) {
        const imageInserts = images.map((url, index) => ({
          property_id: data.id,
          image_url: url,
          is_primary: index === 0,
          display_order: index,
        }));
        
        await supabase.from('property_images').insert(imageInserts);
      }

      toast({
        title: 'Thành công!',
        description: 'Tin đăng đã được gửi và đang chờ admin duyệt',
      });

      // Clear draft after successful submission
      clearDraft();
      setHasDraft(false);

      navigate('/my-properties');
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
    <UserLayout>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <Link to="/my-properties" className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
          {hasDraft && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Save className="h-3 w-3" />
                Đã lưu nháp
              </span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleClearDraft}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Xóa nháp
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl">Đăng tin bất động sản mới</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Điền thông tin chi tiết về bất động sản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold">Thông tin cơ bản</h3>
                
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type" className="text-sm">Mục đích *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bán">Bán</SelectItem>
                        <SelectItem value="Cho thuê">Cho thuê</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-sm">Loại bất động sản *</Label>
                    <Select value={formData.category_id} onValueChange={(value) => handleChange('category_id', value)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Chọn loại BĐS" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-sm">Giá (VNĐ) *</Label>
                    <CurrencyInput
                      id="price"
                      value={formData.price}
                      onChange={(value) => handleChange('price', value)}
                      placeholder="5.000.000.000"
                      className="text-sm"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="area" className="text-sm">Diện tích (m²) *</Label>
                    <Input
                      id="area"
                      type="number"
                      value={formData.area}
                      onChange={(e) => handleChange('area', e.target.value)}
                      placeholder="100"
                      className="text-sm"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-sm">Trạng thái</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                      <SelectTrigger className="text-sm">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Hình ảnh
                </h3>

                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxImages={10}
                />
              </div>

              {/* Map Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Vị trí trên bản đồ
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ghim vị trí chính xác của bất động sản trên bản đồ để người mua dễ tìm kiếm
                </p>
                <MapPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={(lat, lng, address) => {
                    setFormData(prev => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                      location: address || prev.location,
                    }));
                  }}
                />
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mô tả chi tiết</h3>

                <div>
                  <Label htmlFor="description">Mô tả về bất động sản</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Mô tả chi tiết về bất động sản: vị trí, tiện ích xung quanh, đặc điểm nổi bật..."
                    rows={5}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
                <Button type="submit" size="lg" disabled={loading} className="flex-1 text-sm sm:text-base">
                  {loading ? 'Đang đăng...' : 'Đăng tin'}
                </Button>
                <Link to="/my-properties" className="flex-1">
                  <Button type="button" variant="outline" size="lg" className="w-full text-sm sm:text-base">
                    Hủy
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </UserLayout>
  );
}
