import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { ArrowLeft } from 'lucide-react';
import UserLayout from '../components/UserLayout';

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    async function fetchProperty() {
      if (!id || !user) return;

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user.id) // Security: chỉ edit tin của mình
        .single();

      if (error || !data) {
        toast({
          title: 'Lỗi',
          description: 'Không tìm thấy tin đăng hoặc bạn không có quyền chỉnh sửa',
          variant: 'destructive',
        });
        navigate('/my-properties');
        return;
      }

      setFormData(data);
      setInitialLoading(false);
    }

    fetchProperty();
  }, [id, user, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          price: Number.parseInt(formData.price),
          area: Number.parseInt(formData.area),
          bedrooms: formData.bedrooms ? Number.parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? Number.parseInt(formData.bathrooms) : null,
          location: formData.location,
          district: formData.district || null,
          ward: formData.ward || null,
          address_detail: formData.address_detail || null,
          type: formData.type,
          description: formData.description || null,
          image_url: formData.image_url,
          status: formData.status,
          direction: formData.direction,
          legal_status: formData.legal_status,
          furniture_status: formData.furniture_status,
          parking_slots: Number.parseInt(formData.parking_slots || '0'),
          floor_number: formData.floor_number ? Number.parseInt(formData.floor_number) : null,
          year_built: formData.year_built ? Number.parseInt(formData.year_built) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('owner_id', user.id); // Security check

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: 'Tin đăng đã được cập nhật',
      });

      navigate(`/properties/${id}`);
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật tin đăng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
            <p className="text-sm sm:text-base">Đang tải...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="mb-4 sm:mb-6">
          <Link to="/my-properties" className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </div>

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl">Chỉnh sửa tin đăng</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Cập nhật thông tin bất động sản</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic fields - simplified */}
              <div>
                <Label htmlFor="title" className="text-sm">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Giá (VNĐ) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area">Diện tích (m²) *</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area || ''}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Địa chỉ *</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                />
              </div>

              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status || 'Có sẵn'}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
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

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
                <Button type="submit" size="lg" disabled={loading} className="flex-1 text-sm sm:text-base">
                  {loading ? 'Đang cập nhật...' : 'Cập nhật tin đăng'}
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
