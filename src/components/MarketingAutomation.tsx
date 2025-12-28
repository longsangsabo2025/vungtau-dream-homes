import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import {
  Mail,
  MessageSquare,
  Users,
  Target,
  TrendingUp,
  Calendar,
  Settings,
  Zap,
  Send,
  Clock,
  Eye,
  MousePointer,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Filter,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Download,
  Share2
} from 'lucide-react'

interface Campaign {
  id: string
  name: string
  type: 'email' | 'sms' | 'push'
  status: 'active' | 'paused' | 'completed' | 'draft'
  audience: string
  sent: number
  opened: number
  clicked: number
  converted: number
  createdAt: string
  nextRun?: string
}

interface AutomationRule {
  id: string
  name: string
  trigger: string
  action: string
  isActive: boolean
  leads: number
}

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  interest: string
  budget: string
  source: string
  score: number
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  lastActivity: string
}

const MarketingAutomation = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('campaigns')

  // Mock data generation
  const generateMockData = () => {
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'Chào mừng khách hàng mới',
        type: 'email',
        status: 'active',
        audience: 'Khách hàng mới đăng ký',
        sent: 1247,
        opened: 856,
        clicked: 234,
        converted: 47,
        createdAt: '2024-01-15',
        nextRun: '2024-01-20T10:00:00Z'
      },
      {
        id: '2',
        name: 'Cập nhật BDS mới khu vực quan tâm',
        type: 'email',
        status: 'active',
        audience: 'Đã xem BDS 7 ngày qua',
        sent: 3421,
        opened: 2156,
        clicked: 678,
        converted: 89,
        createdAt: '2024-01-10'
      },
      {
        id: '3',
        name: 'SMS nhắc hẹn xem nhà',
        type: 'sms',
        status: 'active',
        audience: 'Đã đặt lịch xem nhà',
        sent: 456,
        opened: 445,
        clicked: 0,
        converted: 178,
        createdAt: '2024-01-12'
      },
      {
        id: '4',
        name: 'Push thông báo giá mới',
        type: 'push',
        status: 'paused',
        audience: 'App users quan tâm',
        sent: 2341,
        opened: 1876,
        clicked: 543,
        converted: 67,
        createdAt: '2024-01-08'
      }
    ]

    const mockRules: AutomationRule[] = [
      {
        id: '1',
        name: 'Tự động gửi email chào mừng',
        trigger: 'Khách hàng đăng ký mới',
        action: 'Gửi email welcome series',
        isActive: true,
        leads: 1247
      },
      {
        id: '2',
        name: 'Nhắc hẹn xem nhà',
        trigger: 'Đặt lịch xem nhà',
        action: 'SMS nhắc trước 1 giờ',
        isActive: true,
        leads: 456
      },
      {
        id: '3',
        name: 'Follow up khách quan tâm',
        trigger: 'Xem BDS > 3 lần',
        action: 'Gọi điện tư vấn',
        isActive: true,
        leads: 234
      },
      {
        id: '4',
        name: 'Tái kích hoạt khách cũ',
        trigger: 'Không hoạt động 30 ngày',
        action: 'Email ưu đãi đặc biệt',
        isActive: false,
        leads: 789
      }
    ]

    const mockLeads: Lead[] = [
      {
        id: '1',
        name: 'Nguyễn Văn An',
        email: 'an.nguyen@email.com',
        phone: '0901234567',
        interest: 'Căn hộ view biển',
        budget: '3-5 tỷ',
        source: 'Facebook Ads',
        score: 85,
        status: 'qualified',
        lastActivity: '2024-01-18T14:30:00Z'
      },
      {
        id: '2',
        name: 'Trần Thị Bình',
        email: 'binh.tran@email.com',
        phone: '0907654321',
        interest: 'Nhà phố kinh doanh',
        budget: '5-7 tỷ',
        source: 'Google Search',
        score: 92,
        status: 'contacted',
        lastActivity: '2024-01-18T09:15:00Z'
      },
      {
        id: '3',
        name: 'Lê Minh Cường',
        email: 'cuong.le@email.com',
        phone: '0912345678',
        interest: 'Đất nền Long Hải',
        budget: '2-3 tỷ',
        source: 'Website',
        score: 67,
        status: 'new',
        lastActivity: '2024-01-17T16:45:00Z'
      }
    ]

    setCampaigns(mockCampaigns)
    setAutomationRules(mockRules)
    setLeads(mockLeads)
  }

  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      generateMockData()
      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'paused': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      case 'draft': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100'
      case 'contacted': return 'text-yellow-600 bg-yellow-100'
      case 'qualified': return 'text-purple-600 bg-purple-100'
      case 'converted': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'push': return <Zap className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  const calculateRate = (numerator: number, denominator: number) => {
    return denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : '0'
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-16 w-16 text-primary animate-spin" />
            <h3 className="text-lg font-semibold mt-4 mb-2">Đang tải hệ thống marketing...</h3>
            <p className="text-muted-foreground text-center">
              Kết nối với CRM và các kênh marketing
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
            <Target className="h-8 w-8 text-primary" />
            Marketing Automation
          </h2>
          <p className="text-muted-foreground mt-1">
            Tự động hóa marketing và quản lý leads thông minh
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tạo campaign mới
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng leads</p>
                <p className="text-2xl font-bold">2,847</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+18.5%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Email gửi</p>
                <p className="text-2xl font-bold">15,429</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+12.3%</span>
                </div>
              </div>
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ mở</p>
                <p className="text-2xl font-bold">68.5%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+5.2%</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chuyển đổi</p>
                <p className="text-2xl font-bold">381</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+23.1%</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="automation">Tự động hóa</TabsTrigger>
          <TabsTrigger value="leads">Quản lý leads</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campaigns đang chạy</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tạo mới
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getCampaignTypeIcon(campaign.type)}
                          <h3 className="font-semibold">{campaign.name}</h3>
                        </div>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status === 'active' ? 'Đang chạy' : 
                           campaign.status === 'paused' ? 'Tạm dừng' :
                           campaign.status === 'completed' ? 'Hoàn thành' : 'Nháp'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          {campaign.status === 'active' ? 
                            <Pause className="h-4 w-4" /> : 
                            <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{campaign.audience}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{campaign.sent.toLocaleString()}</div>
                        <div className="text-xs text-blue-600">Đã gửi</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {calculateRate(campaign.opened, campaign.sent)}%
                        </div>
                        <div className="text-xs text-green-600">Tỷ lệ mở</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {calculateRate(campaign.clicked, campaign.sent)}%
                        </div>
                        <div className="text-xs text-purple-600">Tỷ lệ click</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{campaign.converted}</div>
                        <div className="text-xs text-orange-600">Chuyển đổi</div>
                      </div>
                    </div>

                    {campaign.nextRun && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Gửi tiếp theo: {new Date(campaign.nextRun).toLocaleString('vi-VN')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Quy tắc tự động hóa</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo quy tắc
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <div className="flex items-center gap-2">
                          <Switch checked={rule.isActive} />
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="text-muted-foreground">Khi:</span>
                          <span>{rule.trigger}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-600" />
                          <span className="text-muted-foreground">Thì:</span>
                          <span>{rule.action}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <span className="text-sm text-muted-foreground">
                          {rule.leads.toLocaleString()} leads áp dụng
                        </span>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tạo quy tắc mới</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Tên quy tắc</Label>
                  <Input id="rule-name" placeholder="VD: Tự động follow-up khách VIP" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trigger">Điều kiện kích hoạt</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn điều kiện" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new-signup">Khách hàng đăng ký mới</SelectItem>
                      <SelectItem value="view-property">Xem BDS</SelectItem>
                      <SelectItem value="schedule-visit">Đặt lịch xem nhà</SelectItem>
                      <SelectItem value="high-budget">Ngân sách cao (trên 5 tỷ)</SelectItem>
                      <SelectItem value="inactive">Không hoạt động 30 ngày</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action">Hành động</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hành động" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send-email">Gửi email</SelectItem>
                      <SelectItem value="send-sms">Gửi SMS</SelectItem>
                      <SelectItem value="create-task">Tạo task cho sales</SelectItem>
                      <SelectItem value="call-schedule">Đặt lịch gọi điện</SelectItem>
                      <SelectItem value="push-notification">Push notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delay">Độ trễ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Thực hiện khi nào" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Ngay lập tức</SelectItem>
                      <SelectItem value="1hour">Sau 1 giờ</SelectItem>
                      <SelectItem value="1day">Sau 1 ngày</SelectItem>
                      <SelectItem value="3days">Sau 3 ngày</SelectItem>
                      <SelectItem value="1week">Sau 1 tuần</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Tạo quy tắc
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Danh sách leads</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Lọc
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm lead
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{lead.name}</h3>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getLeadStatusColor(lead.status)}>
                          {lead.status === 'new' ? 'Mới' :
                           lead.status === 'contacted' ? 'Đã liên hệ' :
                           lead.status === 'qualified' ? 'Đủ điều kiện' : 'Chuyển đổi'}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-bold">{lead.score}</div>
                          <div className="text-xs text-muted-foreground">điểm</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Quan tâm</div>
                        <div className="font-medium">{lead.interest}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Ngân sách</div>
                        <div className="font-medium">{lead.budget}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Nguồn</div>
                        <div className="font-medium">{lead.source}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Hoạt động cuối: {new Date(lead.lastActivity).toLocaleString('vi-VN')}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          Liên hệ
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance tổng quan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">68.5%</div>
                      <div className="text-sm text-blue-600">Tỷ lệ mở email</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">24.3%</div>
                      <div className="text-sm text-green-600">Tỷ lệ click</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">8.7%</div>
                      <div className="text-sm text-purple-600">Tỷ lệ chuyển đổi</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">2.1%</div>
                      <div className="text-sm text-orange-600">Tỷ lệ unsubscribe</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top kênh marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { channel: 'Email Marketing', leads: 1247, rate: 68.5, growth: 12.3 },
                    { channel: 'Facebook Ads', leads: 856, rate: 45.2, growth: 18.7 },
                    { channel: 'Google Ads', leads: 634, rate: 52.1, growth: 8.9 },
                    { channel: 'SMS Campaign', leads: 423, rate: 89.2, growth: 25.4 },
                  ].map((item, index) => (
                    <div key={item.channel} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{item.channel}</div>
                          <div className="text-sm text-muted-foreground">{item.leads} leads</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">+{item.growth}%</div>
                        <div className="text-sm text-muted-foreground">{item.rate}% hiệu quả</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ROI Marketing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">385%</div>
                  <div className="text-sm text-muted-foreground">ROI tổng thể</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">12.5 tỷ</div>
                  <div className="text-sm text-muted-foreground">Doanh số từ marketing</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">3.2 tỷ</div>
                  <div className="text-sm text-muted-foreground">Chi phí marketing</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MarketingAutomation