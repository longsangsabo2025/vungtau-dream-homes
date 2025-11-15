import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Plus,
  Edit,
  Trash2,
  FileText,
  Eye,
  Calendar,
  Tag,
} from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail_url: string | null;
  category: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  views: number;
}

interface NewsFormData {
  title: string;
  excerpt: string;
  content: string;
  thumbnail_url: string;
  category: string;
  status: 'draft' | 'published';
}

export default function NewsManagement() {
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    excerpt: '',
    content: '',
    thumbnail_url: '',
    category: 'market-news',
    status: 'draft',
  });
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalViews: 0,
  });

  useEffect(() => {
    // Mock data - trong thực tế sẽ fetch từ database
    const mockArticles: NewsArticle[] = [
      {
        id: 1,
        title: 'Thị trường BĐS Vũng Tàu quý 4/2025: Xu hướng tăng trưởng mạnh',
        slug: 'thi-truong-bds-vung-tau-q4-2025',
        excerpt: 'Thị trường bất động sản Vũng Tàu ghi nhận sự tăng trưởng ấn tượng trong quý 4/2025...',
        content: 'Nội dung chi tiết về thị trường...',
        thumbnail_url: 'https://picsum.photos/400/300?random=1',
        category: 'market-news',
        status: 'published',
        published_at: new Date('2025-11-01').toISOString(),
        created_at: new Date('2025-11-01').toISOString(),
        views: 1250,
      },
      {
        id: 2,
        title: 'Top 5 khu vực đầu tư BĐS tiềm năng tại Vũng Tàu',
        slug: 'top-5-khu-vuc-dau-tu-bds-tiem-nang',
        excerpt: 'Khám phá 5 khu vực có tiềm năng đầu tư cao nhất tại thành phố biển Vũng Tàu...',
        content: 'Nội dung chi tiết...',
        thumbnail_url: 'https://picsum.photos/400/300?random=2',
        category: 'investment-guide',
        status: 'published',
        published_at: new Date('2025-10-28').toISOString(),
        created_at: new Date('2025-10-28').toISOString(),
        views: 890,
      },
      {
        id: 3,
        title: 'Hướng dẫn thủ tục mua bán nhà đất cho người mới',
        slug: 'huong-dan-thu-tuc-mua-ban-nha-dat',
        excerpt: 'Quy trình chi tiết và những lưu ý quan trọng khi thực hiện giao dịch mua bán BĐS...',
        content: 'Nội dung chi tiết...',
        thumbnail_url: 'https://picsum.photos/400/300?random=3',
        category: 'legal-guide',
        status: 'draft',
        published_at: null,
        created_at: new Date('2025-11-10').toISOString(),
        views: 0,
      },
    ];

    setArticles(mockArticles);
    setStats({
      total: mockArticles.length,
      published: mockArticles.filter(a => a.status === 'published').length,
      draft: mockArticles.filter(a => a.status === 'draft').length,
      totalViews: mockArticles.reduce((sum, a) => sum + a.views, 0),
    });
  }, []);

  function openCreateDialog() {
    setEditingArticle(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      thumbnail_url: '',
      category: 'market-news',
      status: 'draft',
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(article: NewsArticle) {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      thumbnail_url: article.thumbnail_url || '',
      category: article.category,
      status: article.status,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Mock save - trong thực tế sẽ call API
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editingArticle) {
        toast({
          title: 'Thành công!',
          description: 'Đã cập nhật bài viết',
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Đã tạo bài viết mới',
        });
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu bài viết',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteArticle(id: number) {
    try {
      // Mock delete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      toast({
        title: 'Thành công!',
        description: 'Đã xóa bài viết',
      });
      
      setArticles(articles.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa bài viết',
        variant: 'destructive',
      });
    }
  }

  async function toggleStatus(article: NewsArticle) {
    try {
      const newStatus = article.status === 'published' ? 'draft' : 'published';
      
      // Mock update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      toast({
        title: 'Thành công!',
        description: `Đã ${newStatus === 'published' ? 'xuất bản' : 'chuyển về nháp'}`,
      });

      setArticles(articles.map(a => 
        a.id === article.id 
          ? { ...a, status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null }
          : a
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái',
        variant: 'destructive',
      });
    }
  }

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const categoryLabels: Record<string, string> = {
    'market-news': 'Tin thị trường',
    'investment-guide': 'Hướng dẫn đầu tư',
    'legal-guide': 'Pháp lý',
    'trends': 'Xu hướng',
    'tips': 'Mẹo hay',
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quản lý tin tức
              </h1>
              <p className="text-gray-600">Quản lý bài viết và tin tức</p>
            </div>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo bài viết
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng bài viết</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.total}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Đã xuất bản</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {stats.published}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bản nháp</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                      {stats.draft}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng lượt xem
                    </p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {stats.totalViews.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-purple-600" />
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
                    placeholder="Tìm kiếm bài viết..."
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
                    <SelectItem value="published">Đã xuất bản</SelectItem>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                Không tìm thấy bài viết nào
              </div>
            ) : (
              filteredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {article.thumbnail_url && (
                    <img
                      src={article.thumbnail_url}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                        {article.status === 'published' ? 'Xuất bản' : 'Nháp'}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {categoryLabels[article.category]}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(article.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(article)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Sửa
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(article)}
                        className={article.status === 'published' ? 'text-yellow-600' : 'text-green-600'}
                      >
                        {article.status === 'published' ? 'Gỡ xuống' : 'Xuất bản'}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không
                              thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteArticle(article.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Create/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingArticle ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                </DialogTitle>
                <VisuallyHidden>
                  <DialogDescription>
                    Form để {editingArticle ? 'chỉnh sửa' : 'tạo'} bài viết
                  </DialogDescription>
                </VisuallyHidden>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tiêu đề *</label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Nhập tiêu đề bài viết..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Danh mục *</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market-news">Tin thị trường</SelectItem>
                        <SelectItem value="investment-guide">Hướng dẫn đầu tư</SelectItem>
                        <SelectItem value="legal-guide">Pháp lý</SelectItem>
                        <SelectItem value="trends">Xu hướng</SelectItem>
                        <SelectItem value="tips">Mẹo hay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Trạng thái *</label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'draft' | 'published') =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Bản nháp</SelectItem>
                        <SelectItem value="published">Xuất bản</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">URL ảnh thumbnail</label>
                  <Input
                    value={formData.thumbnail_url}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Mô tả ngắn *</label>
                  <Textarea
                    required
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    placeholder="Mô tả ngắn về bài viết..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Nội dung *</label>
                  <Textarea
                    required
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Nội dung chi tiết..."
                    rows={10}
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
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Đang lưu...' : editingArticle ? 'Cập nhật' : 'Tạo bài viết'}
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
