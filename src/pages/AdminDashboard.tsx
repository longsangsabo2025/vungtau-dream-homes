import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Home, TrendingUp, Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Xin chào, {user?.email} 👋
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng BĐS
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.totalProperties}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{stats.recentProperties} trong 7 ngày qua
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Lượt xem
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.totalViews.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% so với tháng trước
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Người dùng
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12 người dùng mới
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  BĐS mới
                </CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.recentProperties}
                </div>
                <p className="text-xs text-muted-foreground">
                  Trong 7 ngày qua
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
              <CardDescription>
                Các chức năng quản trị thường dùng
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admin/properties">
                <Button className="w-full gap-2" size="lg">
                  <Building className="h-5 w-5" />
                  Quản lý BĐS
                </Button>
              </Link>
              <Link to="/admin/properties/new">
                <Button className="w-full gap-2" size="lg" variant="outline">
                  <Plus className="h-5 w-5" />
                  Thêm BĐS mới
                </Button>
              </Link>
              <Button className="w-full gap-2" size="lg" variant="outline" disabled>
                <Users className="h-5 w-5" />
                Quản lý người dùng
              </Button>
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
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Hệ thống hoạt động bình thường</p>
                    <p className="text-xs text-muted-foreground">Tất cả dịch vụ đang online</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Database đã được cập nhật</p>
                    <p className="text-xs text-muted-foreground">2 phút trước</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Đang chờ {stats.recentProperties} BĐS mới được duyệt</p>
                    <p className="text-xs text-muted-foreground">5 phút trước</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
