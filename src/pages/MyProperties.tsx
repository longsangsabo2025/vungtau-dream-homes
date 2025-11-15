import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Edit, Trash2, Eye, Plus, TrendingUp } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import UserLayout from '../components/UserLayout';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  type: string;
  status: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  view_count: number;
  created_at: string;
  is_featured: boolean;
  is_verified: boolean;
}

export default function MyProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProperties();
  }, [user]);

  async function fetchMyProperties() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách tin đăng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Bạn có chắc muốn xóa tin "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('owner_id', user?.id); // Security: chỉ xóa tin của mình

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Đã xóa tin đăng',
      });

      // Refresh list
      fetchMyProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa tin đăng',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tin đăng của tôi</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Quản lý tất cả tin bất động sản của bạn
            </p>
          </div>
          <Link to="/my-properties/new" className="w-full sm:w-auto">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Đăng tin mới</span>
            </Button>
          </Link>
        </div>

        {properties.length === 0 ? (
          <Card className="p-6 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Chưa có tin đăng</h3>
              <p className="text-gray-600 mb-6">
                Bắt đầu đăng tin bất động sản để tiếp cận hàng nghìn khách hàng tiềm năng
              </p>
              <Link to="/my-properties/new">
                <Button size="lg">Đăng tin ngay</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <Card className="hidden lg:block overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Trạng thái tin</TableHead>
                      <TableHead>Kiểm duyệt</TableHead>
                      <TableHead className="text-center">Lượt xem</TableHead>
                      <TableHead>Ngày đăng</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <Link
                          to={`/properties/${property.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {property.title}
                        </Link>
                        <div className="flex gap-2">
                          {property.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              Nổi bật
                            </Badge>
                          )}
                          {property.is_verified && (
                            <Badge variant="outline" className="text-xs">
                              Đã xác minh
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{property.type}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('vi-VN').format(property.price)} đ
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          property.status === 'Có sẵn'
                            ? 'default'
                            : property.status === 'Hot'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {property.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={
                            property.approval_status === 'approved'
                              ? 'default'
                              : property.approval_status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {property.approval_status === 'approved'
                            ? '✓ Đã duyệt'
                            : property.approval_status === 'rejected'
                            ? '✗ Từ chối'
                            : '⏳ Chờ duyệt'}
                        </Badge>
                        {property.rejection_reason && (
                          <p className="text-xs text-red-600" title={property.rejection_reason}>
                            {property.rejection_reason.substring(0, 30)}...
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>{property.view_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(property.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/properties/${property.id}`}>
                          <Button variant="ghost" size="icon" title="Xem">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/my-properties/edit/${property.id}`}>
                          <Button variant="ghost" size="icon" title="Chỉnh sửa">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xóa"
                          onClick={() => handleDelete(property.id, property.title)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="border-t p-4 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Tổng số: <strong>{properties.length}</strong> tin đăng •{' '}
                  <strong>
                    {properties.reduce((sum, p) => sum + (p.view_count || 0), 0)}
                  </strong>{' '}
                  lượt xem
                </p>
              </div>
            </Card>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {properties.map((property) => (
                <Card key={property.id} className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/properties/${property.id}`}
                          className="font-medium text-sm sm:text-base text-gray-900 hover:text-primary line-clamp-2"
                        >
                          {property.title}
                        </Link>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {property.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              Nổi bật
                            </Badge>
                          )}
                          {property.is_verified && (
                            <Badge variant="outline" className="text-xs">
                              Đã xác minh
                            </Badge>
                          )}
                          <Badge
                            variant={
                              property.status === 'Có sẵn'
                                ? 'default'
                                : property.status === 'Hot'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {property.status}
                          </Badge>
                          <Badge
                            variant={
                              property.approval_status === 'approved'
                                ? 'default'
                                : property.approval_status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {property.approval_status === 'approved'
                              ? '✓ Đã duyệt'
                              : property.approval_status === 'rejected'
                              ? '✗ Từ chối'
                              : '⏳ Chờ duyệt'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {property.rejection_reason && (
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <p className="text-xs text-red-600">
                          <strong>Lý do từ chối:</strong> {property.rejection_reason}
                        </p>
                      </div>
                    )}

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-500">Loại:</span>{' '}
                        <span className="font-medium">{property.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Lượt xem:</span>{' '}
                        <span className="font-medium">{property.view_count || 0}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Giá:</span>{' '}
                        <span className="font-semibold text-primary">
                          {new Intl.NumberFormat('vi-VN').format(property.price)} đ
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Ngày đăng:</span>{' '}
                        <span className="font-medium">
                          {new Date(property.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Link to={`/properties/${property.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Eye className="h-4 w-4" />
                          Xem
                        </Button>
                      </Link>
                      <Link to={`/my-properties/edit/${property.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Edit className="h-4 w-4" />
                          Sửa
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDelete(property.id, property.title)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Summary for Mobile */}
              <Card className="p-4 bg-gray-50">
                <p className="text-xs sm:text-sm text-gray-600 text-center">
                  Tổng số: <strong>{properties.length}</strong> tin đăng •{' '}
                  <strong>
                    {properties.reduce((sum, p) => sum + (p.view_count || 0), 0)}
                  </strong>{' '}
                  lượt xem
                </p>
              </Card>
            </div>
          </>
        )}
        </div>
      </div>
    </UserLayout>
  );
}
