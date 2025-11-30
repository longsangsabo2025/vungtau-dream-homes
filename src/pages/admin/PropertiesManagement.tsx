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
import { Search, Eye, CheckCircle, XCircle, Clock, Home, Filter } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Label } from '@/components/ui/label';

interface Property {
  id: string;
  title: string;
  price: number;
  area: number;
  location: string;
  type: string; // Transaction type: Bán/Cho thuê
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  owner: {
    full_name: string;
    email: string;
  };
  categories?: {
    name: string;
  };
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

      // Fetch all properties with owner info and category
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey(full_name, email),
          categories(name)
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
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Đang tải...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tiêu đề</TableHead>
                          <TableHead>Người đăng</TableHead>
                          <TableHead>Mục đích</TableHead>
                          <TableHead>Loại BĐS</TableHead>
                          <TableHead>Giá</TableHead>
                          <TableHead>Diện tích</TableHead>
                          <TableHead>Địa điểm</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                          <TableHead>Trạng thái</TableHead>
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
                                <div className="font-medium max-w-xs truncate">
                                  {property.title}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>{property.owner?.full_name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{property.owner?.email}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">{property.type}</Badge>
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
                                    ? 'Đã duyệt'
                                    : property.approval_status === 'rejected'
                                    ? 'Từ chối'
                                    : 'Chờ duyệt'}
                                </Badge>
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

        {/* View Property Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết tin đăng</DialogTitle>
              <VisuallyHidden>
                <DialogDescription>Xem thông tin chi tiết của tin đăng</DialogDescription>
              </VisuallyHidden>
            </DialogHeader>
            {selectedProperty && (
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Tiêu đề:</Label>
                  <p className="mt-1">{selectedProperty.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Giá:</Label>
                    <p className="mt-1 text-blue-600 font-medium">
                      {formatPrice(selectedProperty.price)}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold">Diện tích:</Label>
                    <p className="mt-1">{selectedProperty.area} m²</p>
                  </div>
                </div>
                <div>
                  <Label className="font-semibold">Địa điểm:</Label>
                  <p className="mt-1">{selectedProperty.location}</p>
                </div>
                <div>
                  <Label className="font-semibold">Mục đích:</Label>
                  <p className="mt-1">
                    <Badge variant="outline">{selectedProperty.type}</Badge>
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Loại bất động sản:</Label>
                  <p className="mt-1">{selectedProperty.categories?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Người đăng:</Label>
                  <p className="mt-1">{selectedProperty.owner?.full_name} ({selectedProperty.owner?.email})</p>
                </div>
                <div>
                  <Label className="font-semibold">Trạng thái:</Label>
                  <p className="mt-1">
                    <Badge
                      variant={
                        selectedProperty.approval_status === 'approved'
                          ? 'default'
                          : selectedProperty.approval_status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {selectedProperty.approval_status === 'approved'
                        ? 'Đã duyệt'
                        : selectedProperty.approval_status === 'rejected'
                        ? 'Từ chối'
                        : 'Chờ duyệt'}
                    </Badge>
                  </p>
                </div>
                {selectedProperty.rejection_reason && (
                  <div>
                    <Label className="font-semibold text-red-600">Lý do từ chối:</Label>
                    <p className="mt-1 text-red-600">{selectedProperty.rejection_reason}</p>
                  </div>
                )}
              </div>
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
