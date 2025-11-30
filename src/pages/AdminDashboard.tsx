import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Home, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";

interface Stats {
  totalProperties: number;
  totalViews: number;
  totalUsers: number;
  recentProperties: number;
}

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    totalViews: 0,
    totalUsers: 0,
    recentProperties: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get total properties
        const { count: totalProperties } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true });

        // Get properties from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: recentProperties } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .gte("created_at", sevenDaysAgo.toISOString());

        setStats({
          totalProperties: totalProperties || 0,
          totalViews: 12500, // Mock data - sẽ implement sau
          totalUsers: 450, // Mock data - sẽ implement sau
          recentProperties: recentProperties || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1>
          <p className="mt-2 text-gray-600">Bạn không có quyền truy cập trang này.</p>
          <Link to="/">
            <Button className="mt-4">Về trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Chào mừng trở lại, Admin!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng BĐS</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {loading ? "..." : stats.totalProperties}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    +{stats.recentProperties} trong 7 ngày
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lượt xem</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {loading ? "..." : stats.totalViews.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    +20.1% so với tháng trước
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Người dùng</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {loading ? "..." : stats.totalUsers}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    +12 người dùng mới
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
                  <p className="text-sm font-medium text-gray-600">BĐS mới</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {loading ? "..." : stats.recentProperties}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Trong 7 ngày qua
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Home className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>
              Các chức năng quản trị thường dùng
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/properties" className="block">
              <Button className="w-full gap-2" size="lg">
                <Building className="h-5 w-5" />
                Kiểm duyệt tin
              </Button>
            </Link>
            <Link to="/admin/users" className="block">
              <Button className="w-full gap-2" size="lg" variant="outline">
                <Users className="h-5 w-5" />
                Quản lý Users
              </Button>
            </Link>
            <Link to="/admin/agents" className="block">
              <Button className="w-full gap-2" size="lg" variant="outline">
                <Users className="h-5 w-5" />
                Quản lý Agents
              </Button>
            </Link>
            <Link to="/admin/reports" className="block">
              <Button className="w-full gap-2" size="lg" variant="outline">
                <TrendingUp className="h-5 w-5" />
                Báo cáo
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các thay đổi và cập nhật mới nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Hệ thống hoạt động bình thường</p>
                  <p className="text-xs text-green-600">Tất cả dịch vụ đang online</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 border">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Database đã được cập nhật</p>
                  <p className="text-xs text-gray-500">2 phút trước</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 border">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Home className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Có {stats.recentProperties} tin đăng mới cần kiểm duyệt
                  </p>
                  <p className="text-xs text-gray-500">Trong 7 ngày qua</p>
                </div>
                <Link to="/admin/properties">
                  <Button size="sm" variant="outline">
                    Xem ngay
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
