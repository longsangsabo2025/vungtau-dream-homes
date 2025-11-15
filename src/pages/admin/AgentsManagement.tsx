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
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Award,
  TrendingUp,
  Users,
  Building2,
} from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface Agent {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  bio: string | null;
  license_number: string | null;
  experience_years: number;
  specialization: string | null;
  rating: number;
  total_sales: number;
  is_active: boolean;
  created_at: string;
  properties_count?: number;
}

interface AgentFormData {
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  license_number: string;
  experience_years: number;
  specialization: string;
}

export default function AgentsManagement() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState<AgentFormData>({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    license_number: '',
    experience_years: 0,
    specialization: '',
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalSales: 0,
    avgRating: 0,
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          properties:properties(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const agentsData: Agent[] = data.map((agent) => ({
        ...agent,
        properties_count: agent.properties?.[0]?.count || 0,
      }));

      setAgents(agentsData);

      // Calculate stats
      setStats({
        total: agentsData.length,
        active: agentsData.filter((a) => a.is_active).length,
        totalSales: agentsData.reduce((sum, a) => sum + a.total_sales, 0),
        avgRating:
          agentsData.reduce((sum, a) => sum + a.rating, 0) / agentsData.length || 0,
      });
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách môi giới',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingAgent(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      bio: '',
      license_number: '',
      experience_years: 0,
      specialization: '',
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(agent: Agent) {
    setEditingAgent(agent);
    setFormData({
      full_name: agent.full_name,
      email: agent.email,
      phone: agent.phone,
      bio: agent.bio || '',
      license_number: agent.license_number || '',
      experience_years: agent.experience_years,
      specialization: agent.specialization || '',
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingAgent) {
        // Update existing agent
        const { error } = await supabase
          .from('agents')
          .update({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            bio: formData.bio,
            license_number: formData.license_number,
            experience_years: formData.experience_years,
            specialization: formData.specialization,
          })
          .eq('id', editingAgent.id);

        if (error) throw error;

        toast({
          title: 'Thành công!',
          description: 'Đã cập nhật thông tin môi giới',
        });
      } else {
        // Create new agent
        const { error } = await supabase.from('agents').insert({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          bio: formData.bio,
          license_number: formData.license_number,
          experience_years: formData.experience_years,
          specialization: formData.specialization,
          rating: 0,
          total_sales: 0,
          is_active: true,
        });

        if (error) throw error;

        toast({
          title: 'Thành công!',
          description: 'Đã thêm môi giới mới',
        });
      }

      setIsDialogOpen(false);
      fetchAgents();
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu thông tin môi giới',
        variant: 'destructive',
      });
    }
  }

  async function deleteAgent(id: string) {
    try {
      const { error } = await supabase.from('agents').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: 'Đã xóa môi giới',
      });

      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa môi giới',
        variant: 'destructive',
      });
    }
  }

  async function toggleAgentStatus(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: `Đã ${currentStatus ? 'vô hiệu hóa' : 'kích hoạt'} môi giới`,
      });

      fetchAgents();
    } catch (error) {
      console.error('Error toggling agent status:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái',
        variant: 'destructive',
      });
    }
  }

  const filteredAgents = agents.filter(
    (agent) =>
      agent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.phone.includes(searchTerm)
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quản lý Agents
              </h1>
              <p className="text-gray-600">Quản lý môi giới bất động sản</p>
            </div>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm môi giới
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng môi giới</p>
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
                    <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {stats.active}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng giao dịch
                    </p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {stats.totalSales}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Đánh giá TB
                    </p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                      {stats.avgRating.toFixed(1)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Agents Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách môi giới ({filteredAgents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-gray-500">Đang tải...</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Liên hệ</TableHead>
                        <TableHead>Chứng chỉ</TableHead>
                        <TableHead>Kinh nghiệm</TableHead>
                        <TableHead>Chuyên môn</TableHead>
                        <TableHead>Đánh giá</TableHead>
                        <TableHead>Tin đăng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAgents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                            Không tìm thấy môi giới nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAgents.map((agent) => (
                          <TableRow key={agent.id}>
                            <TableCell>
                              <div className="font-medium">{agent.full_name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {agent.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {agent.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {agent.license_number || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {agent.experience_years} năm
                            </TableCell>
                            <TableCell>
                              {agent.specialization || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Award className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">
                                  {agent.rating.toFixed(1)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">
                                  {agent.properties_count}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={agent.is_active ? 'default' : 'secondary'}
                              >
                                {agent.is_active ? 'Hoạt động' : 'Vô hiệu'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(agent)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toggleAgentStatus(agent.id, agent.is_active)
                                  }
                                  className={
                                    agent.is_active
                                      ? 'text-orange-600'
                                      : 'text-green-600'
                                  }
                                >
                                  {agent.is_active ? 'Vô hiệu' : 'Kích hoạt'}
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Xóa môi giới?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn có chắc chắn muốn xóa môi giới{' '}
                                        <strong>{agent.full_name}</strong>? Hành động này
                                        không thể hoàn tác.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteAgent(agent.id)}
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

          {/* Create/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAgent ? 'Chỉnh sửa môi giới' : 'Thêm môi giới mới'}
                </DialogTitle>
                <VisuallyHidden>
                  <DialogDescription>
                    Form để {editingAgent ? 'chỉnh sửa' : 'thêm'} môi giới
                  </DialogDescription>
                </VisuallyHidden>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Họ tên *</label>
                  <Input
                    required
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Số điện thoại *</label>
                    <Input
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="0901234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Số chứng chỉ</label>
                    <Input
                      value={formData.license_number}
                      onChange={(e) =>
                        setFormData({ ...formData, license_number: e.target.value })
                      }
                      placeholder="ABC123456"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Kinh nghiệm (năm)</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.experience_years}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience_years: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Chuyên môn</label>
                  <Input
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({ ...formData, specialization: e.target.value })
                    }
                    placeholder="Bất động sản cao cấp, Đất nền..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Giới thiệu</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Giới thiệu về môi giới..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit">
                    {editingAgent ? 'Cập nhật' : 'Thêm môi giới'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminLayout>
  );
}
