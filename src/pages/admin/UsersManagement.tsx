import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogTrigger,
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
import { Search, Eye, Lock, Unlock, Users, UserCheck, UserX, Calendar } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  is_active: boolean;
  role: 'user' | 'agent' | 'admin';
  properties_count?: number;
  last_login?: string;
}

export default function UsersManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);

      // Fetch current auth user to get email
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      // Fetch all profiles with property counts
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          properties:properties(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data - use stored email or show as N/A
      const usersData: UserProfile[] = profiles.map((profile) => ({
        id: profile.id,
        full_name: profile.full_name || 'Chưa cập nhật',
        email: profile.email || (profile.id === currentUser?.id ? currentUser.email : 'N/A') || 'N/A',
        phone: profile.phone || 'N/A',
        avatar_url: profile.avatar_url || null,
        created_at: profile.created_at,
        is_active: profile.is_active ?? true,
        role: profile.role || 'user',
        properties_count: profile.properties?.[0]?.count || 0,
      }));

      setUsers(usersData);

      // Calculate stats
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      setStats({
        total: usersData.length,
        active: usersData.filter(u => u.is_active).length,
        inactive: usersData.filter(u => !u.is_active).length,
        newThisMonth: usersData.filter(
          u => new Date(u.created_at) >= firstDayOfMonth
        ).length,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách người dùng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleUserStatus(userId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: `Đã ${!currentStatus ? 'mở khóa' : 'khóa'} tài khoản`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái',
        variant: 'destructive',
      });
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quản lý người dùng
            </h1>
            <p className="text-gray-600">
              Quản lý tài khoản người dùng và quyền hạn
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng người dùng
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.total}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Đang hoạt động
                    </p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {stats.active}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Đã khóa
                    </p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                      {stats.inactive}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <UserX className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Mới tháng này
                    </p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {stats.newThisMonth}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-gray-500">Đang tải...</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Người dùng</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Số điện thoại</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead>Tin đăng</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            Không tìm thấy người dùng nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={user.avatar_url || ''} alt={user.full_name || ''} />
                                  <AvatarFallback>
                                    {user.full_name?.substring(0, 2).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="font-medium">
                                  {user.full_name || 'Chưa cập nhật'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.role === 'admin'
                                    ? 'default'
                                    : user.role === 'agent'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {user.role === 'admin'
                                  ? 'Admin'
                                  : user.role === 'agent'
                                  ? 'Môi giới'
                                  : 'Người dùng'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-blue-600 font-medium">
                                {user.properties_count}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={user.is_active ? 'default' : 'destructive'}
                              >
                                {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedUser(user)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Chi tiết người dùng</DialogTitle>
                                      <VisuallyHidden>
                                        <DialogDescription>
                                          Thông tin chi tiết về người dùng
                                        </DialogDescription>
                                      </VisuallyHidden>
                                    </DialogHeader>
                                    {selectedUser && (
                                      <div className="space-y-4">
                                        <div>
                                          <p className="text-sm font-medium text-gray-500">
                                            Họ tên
                                          </p>
                                          <p className="mt-1">
                                            {selectedUser.full_name || 'Chưa cập nhật'}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-500">
                                            Email
                                          </p>
                                          <p className="mt-1">{selectedUser.email}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-500">
                                            Số điện thoại
                                          </p>
                                          <p className="mt-1">
                                            {selectedUser.phone || 'Chưa cập nhật'}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-500">
                                            Vai trò
                                          </p>
                                          <p className="mt-1 capitalize">
                                            {selectedUser.role}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-500">
                                            Số tin đăng
                                          </p>
                                          <p className="mt-1">
                                            {selectedUser.properties_count}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-500">
                                            Ngày đăng ký
                                          </p>
                                          <p className="mt-1">
                                            {new Date(
                                              selectedUser.created_at
                                            ).toLocaleString('vi-VN')}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-500">
                                            Trạng thái
                                          </p>
                                          <Badge
                                            variant={
                                              selectedUser.is_active
                                                ? 'default'
                                                : 'destructive'
                                            }
                                            className="mt-1"
                                          >
                                            {selectedUser.is_active
                                              ? 'Hoạt động'
                                              : 'Đã khóa'}
                                          </Badge>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={
                                        user.is_active
                                          ? 'text-red-600 hover:text-red-700'
                                          : 'text-green-600 hover:text-green-700'
                                      }
                                    >
                                      {user.is_active ? (
                                        <Lock className="h-4 w-4" />
                                      ) : (
                                        <Unlock className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {user.is_active ? 'Khóa' : 'Mở khóa'} tài khoản?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn có chắc chắn muốn{' '}
                                        {user.is_active ? 'khóa' : 'mở khóa'} tài khoản{' '}
                                        <strong>{user.email}</strong>?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          toggleUserStatus(user.id, user.is_active)
                                        }
                                        className={
                                          user.is_active
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-green-600 hover:bg-green-700'
                                        }
                                      >
                                        {user.is_active ? 'Khóa' : 'Mở khóa'}
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
        </div>
      </div>
    </AdminLayout>
  );
}
