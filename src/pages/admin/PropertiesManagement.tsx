import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, CheckCircle, XCircle, Clock, Home, Filter, Star, Trash2, MapPin, Bed, Bath, Maximize, Calendar, User, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Property {
  id: string;
  title: string;
  price: number;
  area: number;
  location: string;
  type: string; // Transaction type: Bán/Cho thuê
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  is_featured: boolean;
  created_at: string;
  image_url?: string;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  district?: string;
  ward?: string;
  address_detail?: string;
  owner: {
    full_name: string;
    email: string;
    phone?: string;
  };
  categories?: {
    name: string;
  };
  property_images?: {
    id: string;
    image_url: string;
    is_primary: boolean;
  }[];
}

export default function PropertiesManagement() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      setLoading(true);

      // Fetch all properties with owner info, category and images
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey(full_name, email, phone),
          categories(name),
          property_images(id, image_url, is_primary)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProperties(data || []);

      // Calculate stats
      const statsData = {
        total: data?.length || 0,
        pending: data?.filter(p => p.approval_status === 'pending').length || 0,
        approved: data?.filter(p => p.approval_status === 'approved').length || 0,
        rejected: data?.filter(p => p.approval_status === 'rejected').length || 0,
      };
      setStats(statsData);
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

  async function handleApprove(propertyId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('properties')
        .update({
          approval_status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          published_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: 'Tin đăng đã được duyệt',
      });

      fetchProperties();
    } catch (error) {
      console.error('Error approving property:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể duyệt tin đăng',
        variant: 'destructive',
      });
    }
  }

  async function handleReject() {
    if (!selectedProperty || !rejectionReason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do từ chối',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('properties')
        .update({
          approval_status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedProperty.id);

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: 'Tin đăng đã bị từ chối',
      });

      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedProperty(null);
      fetchProperties();
    } catch (error) {
      console.error('Error rejecting property:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể từ chối tin đăng',
        variant: 'destructive',
      });
    }
  }

  const filteredProperties = properties
    .filter(p => p.approval_status === activeTab)
    .filter(p =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Toggle featured status
  async function handleToggleFeatured(propertyId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_featured: !currentStatus })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: currentStatus ? 'Đã bỏ nổi bật' : 'Đã đánh dấu nổi bật',
      });

      fetchProperties();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái nổi bật',
        variant: 'destructive',
      });
    }
  }

  // Bulk approve
  async function handleBulkApprove() {
    if (selectedIds.size === 0) {
      toast({
        title: 'Thông báo',
        description: 'Vui lòng chọn ít nhất một tin đăng',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('properties')
        .update({
          approval_status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          published_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: `Đã duyệt ${selectedIds.size} tin đăng`,
      });

      setSelectedIds(new Set());
      fetchProperties();
    } catch (error) {
      console.error('Error bulk approving:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể duyệt tin đăng',
        variant: 'destructive',
      });
    }
  }

  // Bulk delete
  async function handleBulkDelete() {
    if (selectedIds.size === 0) {
      toast({
        title: 'Thông báo',
        description: 'Vui lòng chọn ít nhất một tin đăng',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: `Đã xóa ${selectedIds.size} tin đăng`,
      });

      setSelectedIds(new Set());
      fetchProperties();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa tin đăng',
        variant: 'destructive',
      });
    }
  }

  // Toggle selection
  function toggleSelection(id: string) {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  }

  // Select all in current tab
  function toggleSelectAll() {
    if (selectedIds.size === filteredProperties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProperties.map(p => p.id)));
    }
  }

  function formatPrice(price: number) {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return `${price.toLocaleString()} đ`;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tin đăng</h1>
          <p className="text-gray-600 mt-2">Kiểm duyệt và quản lý tin đăng bất động sản</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng số tin</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Từ chối</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề, địa điểm, người đăng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách tin đăng</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">
                  Chờ duyệt ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Đã duyệt ({stats.approved})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Từ chối ({stats.rejected})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {/* Bulk Actions */}
                {selectedIds.size > 0 && (
                  <div className="mb-4 flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">
                      Đã chọn {selectedIds.size} tin đăng
                    </span>
                    {activeTab === 'pending' && (
                      <Button size="sm" onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" /> Duyệt tất cả
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-1" /> Xóa tất cả
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa {selectedIds.size} tin đăng? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600">Xóa</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>
                      Bỏ chọn
                    </Button>
                  </div>
                )}

                {loading ? (
                  <p className="text-center py-8 text-gray-500">Đang tải...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <Checkbox
                              checked={selectedIds.size === filteredProperties.length && filteredProperties.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Tiêu đề</TableHead>
                          <TableHead>Người đăng</TableHead>
                          <TableHead>Loại BĐS</TableHead>
                          <TableHead>Giá</TableHead>
                          <TableHead>Diện tích</TableHead>
                          <TableHead>Địa điểm</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                          <TableHead>Nổi bật</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProperties.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                              Không có tin đăng nào
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredProperties.map((property) => (
                            <TableRow key={property.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedIds.has(property.id)}
                                  onCheckedChange={() => toggleSelection(property.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="font-medium max-w-xs truncate">
                                  {property.title}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>{property.owner?.full_name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{property.owner?.email}</div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {property.categories?.name || 'N/A'}
                              </TableCell>
                              <TableCell className="font-medium text-blue-600">
                                {formatPrice(property.price)}
                              </TableCell>
                              <TableCell>{property.area} m²</TableCell>
                              <TableCell>{property.location}</TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {formatDate(property.created_at)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleFeatured(property.id, property.is_featured)}
                                  className={property.is_featured ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}
                                >
                                  <Star className={`h-5 w-5 ${property.is_featured ? 'fill-current' : ''}`} />
                                </Button>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedProperty(property);
                                      setViewDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {property.approval_status === 'pending' && (
                                    <>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleApprove(property.id)}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Duyệt
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedProperty(property);
                                          setRejectDialogOpen(true);
                                        }}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Từ chối
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* View Property Dialog - Enhanced */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl font-bold">Chi tiết tin đăng</DialogTitle>
              <VisuallyHidden>
                <DialogDescription>Xem thông tin chi tiết của tin đăng</DialogDescription>
              </VisuallyHidden>
            </DialogHeader>
            {selectedProperty && (
              <ScrollArea className="max-h-[calc(90vh-80px)]">
                <div className="p-6 pt-4 space-y-6">
                  {/* Image Gallery */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Hình ảnh ({(selectedProperty.property_images?.length || 0) + (selectedProperty.image_url ? 1 : 0)} ảnh)
                    </Label>
                    {(() => {
                      const allImages = [
                        ...(selectedProperty.image_url ? [selectedProperty.image_url] : []),
                        ...(selectedProperty.property_images?.map(img => img.image_url) || [])
                      ];
                      
                      if (allImages.length === 0) {
                        return (
                          <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>Không có hình ảnh</p>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {allImages.slice(0, 6).map((url, index) => (
                            <div key={index} className="relative group bg-muted rounded-lg h-32 flex items-center justify-center overflow-hidden border">
                              <img
                                src={url}
                                alt={`Ảnh ${index + 1}`}
                                className="max-w-full max-h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(url, '_blank')}
                              />
                              {index === 0 && (
                                <Badge className="absolute top-2 left-2 text-xs">Ảnh chính</Badge>
                              )}
                            </div>
                          ))}
                          {allImages.length > 6 && (
                            <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                              <span className="text-muted-foreground font-medium">+{allImages.length - 6} ảnh</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <Separator />

                  {/* Title & Status */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold leading-tight">{selectedProperty.title}</h3>
                      <Badge
                        variant={
                          selectedProperty.approval_status === 'approved'
                            ? 'default'
                            : selectedProperty.approval_status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="shrink-0"
                      >
                        {selectedProperty.approval_status === 'approved'
                          ? 'Đã duyệt'
                          : selectedProperty.approval_status === 'rejected'
                          ? 'Từ chối'
                          : 'Chờ duyệt'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedProperty.location}</span>
                    </div>
                  </div>

                  {/* Price & Key Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Giá</p>
                      <p className="text-xl font-bold text-blue-600">{formatPrice(selectedProperty.price)}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Maximize className="h-4 w-4" />
                        <span>Diện tích</span>
                      </div>
                      <p className="text-xl font-bold text-green-600">{selectedProperty.area} m²</p>
                    </div>
                    {selectedProperty.bedrooms !== undefined && selectedProperty.bedrooms > 0 && (
                      <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                          <Bed className="h-4 w-4" />
                          <span>Phòng ngủ</span>
                        </div>
                        <p className="text-xl font-bold text-orange-600">{selectedProperty.bedrooms}</p>
                      </div>
                    )}
                    {selectedProperty.bathrooms !== undefined && selectedProperty.bathrooms > 0 && (
                      <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                          <Bath className="h-4 w-4" />
                          <span>Phòng tắm</span>
                        </div>
                        <p className="text-xl font-bold text-purple-600">{selectedProperty.bathrooms}</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-muted-foreground">Loại giao dịch</Label>
                        <p className="mt-1">
                          <Badge variant="outline" className="font-medium">{selectedProperty.type}</Badge>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Loại bất động sản</Label>
                        <p className="mt-1 font-medium">{selectedProperty.categories?.name || 'Chưa phân loại'}</p>
                      </div>
                      {selectedProperty.district && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Quận/Huyện</Label>
                          <p className="mt-1 font-medium">{selectedProperty.district}</p>
                        </div>
                      )}
                      {selectedProperty.ward && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Phường/Xã</Label>
                          <p className="mt-1 font-medium">{selectedProperty.ward}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-muted-foreground flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Người đăng
                        </Label>
                        <p className="mt-1 font-medium">{selectedProperty.owner?.full_name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{selectedProperty.owner?.email}</p>
                        {selectedProperty.owner?.phone && (
                          <p className="text-sm text-muted-foreground">{selectedProperty.owner.phone}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Ngày tạo
                        </Label>
                        <p className="mt-1 font-medium">
                          {new Date(selectedProperty.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedProperty.description && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-semibold text-muted-foreground">Mô tả chi tiết</Label>
                        <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedProperty.description}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Rejection Reason */}
                  {selectedProperty.rejection_reason && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <Label className="text-sm font-semibold text-red-600 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Lý do từ chối
                      </Label>
                      <p className="mt-2 text-red-600">{selectedProperty.rejection_reason}</p>
                    </div>
                  )}

                  {/* Action Buttons for Pending Properties */}
                  {selectedProperty.approval_status === 'pending' && (
                    <>
                      <Separator />
                      <div className="flex gap-3 justify-end">
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setViewDialogOpen(false);
                            setRejectDialogOpen(true);
                          }}
                          className="gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </Button>
                        <Button
                          onClick={() => {
                            handleApprove(selectedProperty.id);
                            setViewDialogOpen(false);
                          }}
                          className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Duyệt tin
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Từ chối tin đăng</DialogTitle>
              <DialogDescription>
                Vui lòng nhập lý do từ chối tin đăng này
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Lý do từ chối *</Label>
                <Textarea
                  placeholder="Nhập lý do từ chối..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Xác nhận từ chối
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
