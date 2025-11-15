import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Home, Heart, Mail, TrendingUp, Plus } from 'lucide-react';
import UserLayout from '../components/UserLayout';

interface Stats {
  myProperties: number;
  favorites: number;
  inquiries: number;
  totalViews: number;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    myProperties: 0,
    favorites: 0,
    inquiries: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;

      try {
        // Count my properties
        const { count: propertiesCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id);

        // Count favorites
        const { count: favoritesCount } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Count inquiries about my properties
        const { data: myProps } = await supabase
          .from('properties')
          .select('id')
          .eq('owner_id', user.id);

        const propertyIds = myProps?.map(p => p.id) || [];
        
        let inquiriesCount = 0;
        if (propertyIds.length > 0) {
          const { count } = await supabase
            .from('inquiries')
            .select('*', { count: 'exact', head: true })
            .in('property_id', propertyIds);
          inquiriesCount = count || 0;
        }

        // Total views of my properties
        let totalViews = 0;
        if (propertyIds.length > 0) {
          const { data: viewsData } = await supabase
            .from('properties')
            .select('view_count')
            .in('id', propertyIds);
          
          totalViews = viewsData?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
        }

        setStats({
          myProperties: propertiesCount || 0,
          favorites: favoritesCount || 0,
          inquiries: inquiriesCount,
          totalViews,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

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
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 truncate">
            Chào mừng trở lại, {user?.email}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <Link to="/my-properties/new">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Đăng tin bất động sản mới</span>
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tin đăng của tôi
              </CardTitle>
              <Home className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myProperties}</div>
              <p className="text-xs text-gray-500 mt-1">
                <Link to="/my-properties" className="text-primary hover:underline">
                  Xem tất cả →
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Yêu thích
              </CardTitle>
              <Heart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favorites}</div>
              <p className="text-xs text-gray-500 mt-1">
                <Link to="/favorites" className="text-primary hover:underline">
                  Xem danh sách →
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Liên hệ
              </CardTitle>
              <Mail className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inquiries}</div>
              <p className="text-xs text-gray-500 mt-1">Liên hệ về tin của bạn</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Lượt xem
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-gray-500 mt-1">Tổng lượt xem tin đăng</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Hoạt động gần đây</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Các tin đăng và hoạt động mới nhất của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <RecentActivity userId={user?.id} />
          </CardContent>
        </Card>
        </div>
      </div>
    </UserLayout>
  );
}

interface RecentProperty {
  id: string;
  title: string;
  status: string;
  created_at: string;
  view_count: number;
}

function RecentActivity({ userId }: Readonly<{ userId?: string }>) {
  const [properties, setProperties] = useState<RecentProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentProperties() {
      if (!userId) return;

      const { data, error } = await supabase
        .from('properties')
        .select('id, title, status, created_at, view_count')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setProperties(data);
      }
      setLoading(false);
    }

    fetchRecentProperties();
  }, [userId]);

  if (loading) {
    return <p className="text-sm text-gray-500">Đang tải...</p>;
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Bạn chưa có tin đăng nào</p>
        <Link to="/my-properties/new">
          <Button>Đăng tin ngay</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {properties.map((property) => (
        <div
          key={property.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex-1 min-w-0">
            <Link
              to={`/properties/${property.id}`}
              className="font-medium text-sm sm:text-base text-gray-900 hover:text-primary line-clamp-2"
            >
              {property.title}
            </Link>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500">
              <span className="truncate">Trạng thái: {property.status}</span>
              <span className="hidden sm:inline">•</span>
              <span>{property.view_count || 0} lượt xem</span>
              <span className="hidden sm:inline">•</span>
              <span className="truncate">{new Date(property.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
          <Link to={`/my-properties/edit/${property.id}`} className="sm:flex-shrink-0">
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
              Chỉnh sửa
            </Button>
          </Link>
        </div>
      ))}
      
      {properties.length >= 5 && (
        <div className="text-center pt-4">
          <Link to="/my-properties">
            <Button variant="outline">Xem tất cả tin đăng →</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
