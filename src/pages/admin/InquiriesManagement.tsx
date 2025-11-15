import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Search,
  MessageSquare,
  Check,
  X,
  Clock,
  Send,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface Inquiry {
  id: string;
  property_id: string | null;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'replied' | 'closed';
  admin_reply: string | null;
  created_at: string;
  replied_at: string | null;
  property?: {
    title: string;
  };
}

export default function InquiriesManagement() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    replied: 0,
    closed: 0,
  });

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          property:properties(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInquiries(data || []);

      // Calculate stats
      setStats({
        total: data?.length || 0,
        pending: data?.filter((i) => i.status === 'pending').length || 0,
        replied: data?.filter((i) => i.status === 'replied').length || 0,
        closed: data?.filter((i) => i.status === 'closed').length || 0,
      });
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách yêu cầu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  function openReplyDialog(inquiry: Inquiry) {
    setSelectedInquiry(inquiry);
    setReplyMessage(inquiry.admin_reply || '');
    setIsReplyDialogOpen(true);
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedInquiry || !replyMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('inquiries')
        .update({
          admin_reply: replyMessage,
          status: 'replied',
          replied_at: new Date().toISOString(),
        })
        .eq('id', selectedInquiry.id);

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: 'Đã gửi phản hồi',
      });

      setIsReplyDialogOpen(false);
      fetchInquiries();
    } catch (error) {
      console.error('Error replying:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi phản hồi',
        variant: 'destructive',
      });
    }
  }

  async function updateStatus(id: string, status: 'pending' | 'replied' | 'closed') {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: 'Đã cập nhật trạng thái',
      });

      fetchInquiries();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái',
        variant: 'destructive',
      });
    }
  }

  async function deleteInquiry(id: string) {
    try {
      const { error } = await supabase.from('inquiries').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: 'Đã xóa yêu cầu',
      });

      fetchInquiries();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa yêu cầu',
        variant: 'destructive',
      });
    }
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.phone.includes(searchTerm) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quản lý yêu cầu tư vấn
            </h1>
            <p className="text-gray-600">
              Quản lý và phản hồi yêu cầu từ khách hàng
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng yêu cầu</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.total}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">
                      {stats.pending}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">Đã trả lời</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {stats.replied}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Đã đóng</p>
                    <p className="text-3xl font-bold text-gray-600 mt-2">
                      {stats.closed}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <X className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email, SĐT, nội dung..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="replied">Đã trả lời</SelectItem>
                    <SelectItem value="closed">Đã đóng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inquiries Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách yêu cầu ({filteredInquiries.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-gray-500">Đang tải...</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Liên hệ</TableHead>
                        <TableHead>Tin đăng</TableHead>
                        <TableHead>Nội dung</TableHead>
                        <TableHead>Ngày gửi</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInquiries.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-gray-500"
                          >
                            Không tìm thấy yêu cầu nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInquiries.map((inquiry) => (
                          <TableRow key={inquiry.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <div className="font-medium">{inquiry.full_name}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {inquiry.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {inquiry.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {inquiry.property?.title ? (
                                <span className="text-sm">
                                  {inquiry.property.title.substring(0, 40)}...
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <p className="text-sm line-clamp-2">
                                  {inquiry.message}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(inquiry.created_at).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  inquiry.status === 'pending'
                                    ? 'secondary'
                                    : inquiry.status === 'replied'
                                    ? 'default'
                                    : 'outline'
                                }
                              >
                                {inquiry.status === 'pending'
                                  ? 'Chờ xử lý'
                                  : inquiry.status === 'replied'
                                  ? 'Đã trả lời'
                                  : 'Đã đóng'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openReplyDialog(inquiry)}
                                  disabled={inquiry.status === 'closed'}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>

                                {inquiry.status === 'pending' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateStatus(inquiry.id, 'closed')}
                                    className="text-orange-600"
                                  >
                                    Đóng
                                  </Button>
                                )}

                                {inquiry.status === 'replied' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateStatus(inquiry.id, 'closed')}
                                    className="text-gray-600"
                                  >
                                    Đóng
                                  </Button>
                                )}

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Xóa yêu cầu?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn có chắc chắn muốn xóa yêu cầu này? Hành
                                        động này không thể hoàn tác.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteInquiry(inquiry.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Xóa
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reply Dialog */}
          <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Trả lời yêu cầu tư vấn</DialogTitle>
                <VisuallyHidden>
                  <DialogDescription>
                    Form để trả lời yêu cầu tư vấn từ khách hàng
                  </DialogDescription>
                </VisuallyHidden>
              </DialogHeader>
              {selectedInquiry && (
                <form onSubmit={handleReply} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Thông tin khách hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Họ tên:</span>{' '}
                          {selectedInquiry.full_name}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>{' '}
                          {selectedInquiry.email}
                        </div>
                        <div>
                          <span className="font-medium">SĐT:</span>{' '}
                          {selectedInquiry.phone}
                        </div>
                        <div>
                          <span className="font-medium">Ngày gửi:</span>{' '}
                          {new Date(selectedInquiry.created_at).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-1">Nội dung yêu cầu:</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {selectedInquiry.message}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Nội dung trả lời
                    </label>
                    <Textarea
                      required
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Nhập nội dung trả lời..."
                      rows={6}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsReplyDialogOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" className="gap-2">
                      <Send className="h-4 w-4" />
                      Gửi trả lời
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminLayout>
  );
}
