import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  Users,
  Home,
  TrendingUp,
  DollarSign,
  Eye,
  MessageSquare,
  Calendar,
  Settings,
  Bell,
  Activity,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Share2,
  Plus,
  Edit,
  MoreHorizontal,
  MapPin,
  Star,
  Phone
} from 'lucide-react'

interface DashboardMetrics {
  totalProperties: number
  activeListings: number
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  totalInquiries: number
  newInquiries: number
  conversionRate: number
  avgResponseTime: number
}

interface PropertyStats {
  month: string
  listed: number
  sold: number
  inquiries: number
  revenue: number
}

interface UserActivity {
  hour: string
  users: number
  pageViews: number
}

interface TopProperty {
  id: string
  title: string
  location: string
  price: number
  views: number
  inquiries: number
  status: 'active' | 'pending' | 'sold'
}

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [propertyStats, setPropertyStats] = useState<PropertyStats[]>([])
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [topProperties, setTopProperties] = useState<TopProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const generateMockData = () => {
    // Mock metrics
    const mockMetrics: DashboardMetrics = {
      totalProperties: 1247,
      activeListings: 856,
      totalUsers: 15429,
      activeUsers: 3241,
      totalRevenue: 18500000000, // 18.5 billion VND
      monthlyRevenue: 2800000000, // 2.8 billion VND this month
      totalInquiries: 5847,
      newInquiries: 234,
      conversionRate: 8.7,
      avgResponseTime: 2.3 // hours
    }

    // Mock property stats for the last 6 months
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const mockPropertyStats: PropertyStats[] = months.map(month => ({
      month,
      listed: Math.floor(Math.random() * 50 + 80),
      sold: Math.floor(Math.random() * 30 + 40),
      inquiries: Math.floor(Math.random() * 200 + 300),
      revenue: Math.random() * 1000000000 + 2000000000
    }))

    // Mock user activity for the last 24 hours
    const mockUserActivity: UserActivity[] = []
    for (let i = 0; i < 24; i++) {
      mockUserActivity.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        users: Math.floor(Math.random() * 200 + 100),
        pageViews: Math.floor(Math.random() * 800 + 400)
      })
    }

    // Mock top properties
    const mockTopProperties: TopProperty[] = [
      {
        id: '1',
        title: 'Căn hộ cao cấp Thủy Vân Resort',
        location: 'Phường 8, TP. Vũng Tàu',
        price: 3200000000,
        views: 1247,
        inquiries: 89,
        status: 'active'
      },
      {
        id: '2',
        title: 'Nhà phố mặt biển Bãi Sau',
        location: 'Phường 2, TP. Vũng Tàu', 
        price: 5800000000,
        views: 934,
        inquiries: 67,
        status: 'pending'
      },
      {
        id: '3',
        title: 'Villa nghỉ dưỡng Long Hải',
        location: 'Thắng Tam, Vũng Tàu',
        price: 8500000000,
        views: 756,
        inquiries: 45,
        status: 'active'
      },
      {
        id: '4',
        title: 'Đất nền dự án Ocean Park',
        location: 'Phường 1, TP. Vũng Tàu',
        price: 2100000000,
        views: 623,
        inquiries: 78,
        status: 'sold'
      }
    ]

    setMetrics(mockMetrics)
    setPropertyStats(mockPropertyStats)
    setUserActivity(mockUserActivity)
    setTopProperties(mockTopProperties)
  }

  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      generateMockData()
      setIsLoading(false)
    }, 1200)
  }, [])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ VNĐ`
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} triệu VNĐ`
    }
    return `${amount.toLocaleString('vi-VN')} VNĐ`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'  
      case 'sold': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Đang bán'
      case 'pending': return 'Chờ duyệt'
      case 'sold': return 'Đã bán'
      default: return status
    }
  }

  if (isLoading || !metrics) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-16 w-16 text-primary animate-pulse" />
            <h3 className="text-lg font-semibold mt-4 mb-2">Đang tải dashboard...</h3>
            <p className="text-muted-foreground text-center">
              Đồng bộ dữ liệu từ tất cả hệ thống
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Tổng quan và quản lý hệ thống VungTau Dream Homes
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Thông báo
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm BDS
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng BDS</p>
                <p className="text-2xl font-bold">{metrics.totalProperties.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    {metrics.activeListings} đang bán
                  </span>
                </div>
              </div>
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Người dùng</p>
                <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    {metrics.activeUsers.toLocaleString()} hoạt động
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Doanh thu</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    +{formatCurrency(metrics.monthlyRevenue)} tháng này
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tư vấn</p>
                <p className="text-2xl font-bold">{metrics.totalInquiries.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">
                    {metrics.newInquiries} mới hôm nay
                  </span>
                </div>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{metrics.conversionRate}%</div>
            <div className="text-sm text-muted-foreground">Tỷ lệ chuyển đổi</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600">+2.3% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{metrics.avgResponseTime}h</div>
            <div className="text-sm text-muted-foreground">Thời gian phản hồi TB</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600">Cải thiện 15%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">94.2%</div>
            <div className="text-sm text-muted-foreground">Độ hài lòng khách hàng</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs text-green-600">4.8/5 sao</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="properties">BDS</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="system">Hệ thống</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue & Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu & Giao dịch (6 tháng qua)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={propertyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'revenue') return [formatCurrency(value as number), 'Doanh thu']
                      return [value, name === 'sold' ? 'Đã bán' : 'Niêm yết']
                    }}
                  />
                  <Legend />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                    name="Doanh thu"
                  />
                  <Bar yAxisId="left" dataKey="sold" fill="#82ca9d" name="Đã bán" />
                  <Bar yAxisId="left" dataKey="listed" fill="#ffc658" name="Niêm yết" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động người dùng (24h qua)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} name="Người dùng" />
                  <Line type="monotone" dataKey="pageViews" stroke="#82ca9d" strokeWidth={2} name="Lượt xem" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          {/* Top Properties */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>BDS có hiệu suất cao nhất</CardTitle>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Xem tất cả
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProperties.map((property, index) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{property.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(property.price)}</div>
                        <div className="text-sm text-muted-foreground">Giá bán</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{property.views.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Lượt xem</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{property.inquiries}</div>
                        <div className="text-sm text-muted-foreground">Quan tâm</div>
                      </div>
                      
                      <Badge className={getStatusColor(property.status)}>
                        {getStatusText(property.status)}
                      </Badge>
                      
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Property Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố theo khu vực</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Phường 1', value: 32, fill: '#8884d8' },
                        { name: 'Phường 2', value: 28, fill: '#82ca9d' },
                        { name: 'Thắng Tam', value: 25, fill: '#ffc658' },
                        { name: 'Long Hải', value: 15, fill: '#ff7300' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                    >
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phân bố theo loại BDS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Căn hộ', count: 456, percentage: 36.5, color: 'bg-blue-500' },
                    { type: 'Nhà phố', count: 324, percentage: 26.0, color: 'bg-green-500' },
                    { type: 'Villa', count: 234, percentage: 18.8, color: 'bg-purple-500' },
                    { type: 'Đất nền', count: 233, percentage: 18.7, color: 'bg-orange-500' }
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${item.color}`} />
                        <span className="font-medium">{item.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.count} BDS</div>
                        <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê người dùng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">15,429</div>
                    <div className="text-sm text-blue-600">Tổng người dùng</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">3,241</div>
                    <div className="text-sm text-green-600">Hoạt động</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">1,247</div>
                    <div className="text-sm text-purple-600">Đăng ký tuần này</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">89.2%</div>
                    <div className="text-sm text-orange-600">Tỷ lệ giữ chân</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'Người dùng mới đăng ký', user: 'nguyenvan***', time: '5 phút trước', icon: Users, color: 'text-green-600' },
                    { action: 'Đăng BDS mới', user: 'tranminh***', time: '12 phút trước', icon: Home, color: 'text-blue-600' },
                    { action: 'Yêu cầu tư vấn', user: 'lethimai***', time: '18 phút trước', icon: MessageSquare, color: 'text-purple-600' },
                    { action: 'Đặt lịch xem nhà', user: 'phamvan***', time: '25 phút trước', icon: Calendar, color: 'text-orange-600' },
                    { action: 'Liên hệ hotline', user: 'hoangthiha***', time: '32 phút trước', icon: Phone, color: 'text-red-600' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <activity.icon className={`h-5 w-5 ${activity.color}`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{activity.action}</div>
                        <div className="text-xs text-muted-foreground">
                          {activity.user} • {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái hệ thống</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { service: 'Website', status: 'online', uptime: '99.9%', color: 'text-green-600' },
                    { service: 'Database', status: 'online', uptime: '99.8%', color: 'text-green-600' },
                    { service: 'API Server', status: 'online', uptime: '99.7%', color: 'text-green-600' },
                    { service: 'CDN', status: 'warning', uptime: '98.5%', color: 'text-yellow-600' },
                    { service: 'Email Service', status: 'online', uptime: '99.6%', color: 'text-green-600' },
                  ].map((service) => (
                    <div key={service.service} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {service.status === 'online' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className="font-medium">{service.service}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${service.color}`}>
                          {service.status === 'online' ? 'Hoạt động' : 'Cảnh báo'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Uptime: {service.uptime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê hiệu năng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">1.2s</div>
                    <div className="text-sm text-blue-600">Thời gian tải TB</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">95</div>
                    <div className="text-sm text-green-600">PageSpeed Score</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">2.1TB</div>
                    <div className="text-sm text-purple-600">Băng thông/tháng</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">0.02%</div>
                    <div className="text-sm text-orange-600">Error rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Backup & Security */}
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật & Sao lưu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Sao lưu tự động</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Lần cuối: Hôm nay 03:00
                  </div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">SSL Certificate</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Hết hạn: 15/06/2024
                  </div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Firewall</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Hoạt động bình thường
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Hành động nhanh</h3>
              <p className="text-muted-foreground">Các tác vụ quản trị thường dùng</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Thêm BDS
              </Button>
              <Button size="sm" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Quản lý user
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Phản hồi tư vấn
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Báo cáo tổng thể
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard