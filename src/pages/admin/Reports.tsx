import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
} from 'lucide-react';

export default function Reports() {
  const [timeRange, setTimeRange] = useState('30days');
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUsers: 0,
    totalViews: 0,
    totalInquiries: 0,
    totalFavorites: 0,
    activeListings: 0,
    newUsersThisMonth: 0,
    newPropertiesThisMonth: 0,
  });

  const [revenueData] = useState([
    { month: 'T1', value: 45000000 },
    { month: 'T2', value: 52000000 },
    { month: 'T3', value: 48000000 },
    { month: 'T4', value: 61000000 },
    { month: 'T5', value: 55000000 },
    { month: 'T6', value: 67000000 },
    { month: 'T7', value: 72000000 },
    { month: 'T8', value: 68000000 },
    { month: 'T9', value: 75000000 },
    { month: 'T10', value: 82000000 },
    { month: 'T11', value: 79000000 },
    { month: 'T12', value: 88000000 },
  ]);

  const [propertyTypeData] = useState([
    { type: 'Nhà riêng', count: 45, percentage: 35 },
    { type: 'Căn hộ', count: 38, percentage: 30 },
    { type: 'Đất nền', count: 25, percentage: 20 },
    { type: 'Biệt thự', count: 12, percentage: 10 },
    { type: 'Khác', count: 6, percentage: 5 },
  ]);

  const [topProperties] = useState([
    { id: 1, title: 'Villa Vũng Tàu view biển cực đẹp', views: 2547, inquiries: 45 },
    { id: 2, title: 'Căn hộ cao cấp The Sóng Vũng Tàu', views: 2103, inquiries: 38 },
    { id: 3, title: 'Nhà phố trung tâm Vũng Tàu', views: 1876, inquiries: 32 },
    { id: 4, title: 'Đất nền KDC Long Sơn', views: 1654, inquiries: 28 },
    { id: 5, title: 'Biệt thự biển Bãi Dài', views: 1432, inquiries: 25 },
  ]);

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  async function fetchStats() {
    try {
      // Fetch total properties
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Fetch total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total views
      const { count: viewsCount } = await supabase
        .from('property_views')
        .select('*', { count: 'exact', head: true });

      // Fetch total inquiries
      const { count: inquiriesCount } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true });

      // Fetch total favorites
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true });

      // Fetch active listings
      const { count: activeCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

      // Calculate new users this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      const { count: newPropertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      setStats({
        totalProperties: propertiesCount || 0,
        totalUsers: usersCount || 0,
        totalViews: viewsCount || 0,
        totalInquiries: inquiriesCount || 0,
        totalFavorites: favoritesCount || 0,
        activeListings: activeCount || 0,
        newUsersThisMonth: newUsersCount || 0,
        newPropertiesThisMonth: newPropertiesCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  const maxRevenue = Math.max(...revenueData.map((d) => d.value));

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Báo cáo & Thống kê
              </h1>
              <p className="text-gray-600">Tổng quan về hoạt động hệ thống</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 ngày qua</SelectItem>
                <SelectItem value="30days">30 ngày qua</SelectItem>
                <SelectItem value="90days">90 ngày qua</SelectItem>
                <SelectItem value="year">Năm nay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng tin đăng
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.totalProperties}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      +{stats.newPropertiesThisMonth} tháng này
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Người dùng
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.totalUsers}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      +{stats.newUsersThisMonth} tháng này
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Lượt xem
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.totalViews.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      +15% so với tháng trước
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
                    <p className="text-sm font-medium text-gray-600">
                      Yêu cầu tư vấn
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.totalInquiries}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      +22% so với tháng trước
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tin đang hiển thị
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stats.activeListings}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Lượt yêu thích
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stats.totalFavorites}
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tỷ lệ chuyển đổi
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stats.totalViews > 0
                        ? ((stats.totalInquiries / stats.totalViews) * 100).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Doanh thu theo tháng (VNĐ)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <div className="flex items-end justify-between h-full gap-2">
                  {revenueData.map((item) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col justify-end h-full pb-8">
                        <div
                          className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors cursor-pointer relative group"
                          style={{
                            height: `${(item.value / maxRevenue) * 100}%`,
                            minHeight: '20px',
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {(item.value / 1000000).toFixed(0)}M
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{item.month}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Property Types */}
            <Card>
              <CardHeader>
                <CardTitle>Phân loại BĐS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {propertyTypeData.map((item) => (
                    <div key={item.type}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {item.type}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Tin đăng nổi bật</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProperties.map((property, index) => (
                    <div
                      key={property.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {property.title}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Eye className="h-3 w-3" />
                            {property.views.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MessageSquare className="h-3 w-3" />
                            {property.inquiries}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Tin đăng mới được tạo</p>
                    <p className="text-xs text-gray-500">2 giờ trước</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">5 người dùng mới đăng ký</p>
                    <p className="text-xs text-gray-500">4 giờ trước</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">12 yêu cầu tư vấn mới</p>
                    <p className="text-xs text-gray-500">6 giờ trước</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Lượt xem tăng 25%</p>
                    <p className="text-xs text-gray-500">Hôm qua</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
