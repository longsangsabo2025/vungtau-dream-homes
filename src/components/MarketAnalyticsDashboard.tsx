import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  DollarSign,
  Home,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
  Activity,
  MapPin,
  Users,
  Clock,
  Zap
} from 'lucide-react'

interface MarketData {
  priceHistory: Array<{
    month: string
    averagePrice: number
    sales: number
    inventory: number
  }>
  areaComparison: Array<{
    area: string
    averagePrice: number
    growth: number
    volume: number
  }>
  propertyTypes: Array<{
    type: string
    value: number
    growth: number
    color: string
  }>
  marketIndicators: {
    averagePrice: number
    priceChange: number
    salesVolume: number
    volumeChange: number
    daysOnMarket: number
    domChange: number
    inventory: number
    inventoryChange: number
  }
  predictions: Array<{
    period: string
    predicted: number
    confidence: number
  }>
  hotspots: Array<{
    area: string
    score: number
    growth: number
    potential: string
  }>
}

const MarketAnalyticsDashboard = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [timeframe, setTimeframe] = useState('12months')
  const [selectedArea, setSelectedArea] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data generation
  const generateMarketData = (): MarketData => {
    const months = [
      'Jan 2023', 'Feb 2023', 'Mar 2023', 'Apr 2023', 'May 2023', 'Jun 2023',
      'Jul 2023', 'Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023'
    ]

    const priceHistory = months.map((month, index) => ({
      month,
      averagePrice: 2800000000 + (index * 45000000) + (Math.random() * 200000000 - 100000000),
      sales: Math.floor(120 + Math.random() * 80),
      inventory: Math.floor(450 + Math.random() * 100)
    }))

    const areas = ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Thắng Tam', 'Long Hải']
    const areaComparison = areas.map(area => ({
      area,
      averagePrice: 2500000000 + Math.random() * 2000000000,
      growth: Math.random() * 20 - 5,
      volume: Math.floor(Math.random() * 150 + 50)
    }))

    const propertyTypes = [
      { type: 'Căn hộ', value: 45, growth: 8.5, color: '#8884d8' },
      { type: 'Nhà phố', value: 28, growth: 12.3, color: '#82ca9d' },
      { type: 'Villa', value: 15, growth: 6.7, color: '#ffc658' },
      { type: 'Đất nền', value: 12, growth: 15.2, color: '#ff7300' }
    ]

    const marketIndicators = {
      averagePrice: 3200000000,
      priceChange: 12.5,
      salesVolume: 1847,
      volumeChange: 8.3,
      daysOnMarket: 28,
      domChange: -5.2,
      inventory: 2341,
      inventoryChange: -12.8
    }

    const predictions = [
      { period: 'Q1 2024', predicted: 3350000000, confidence: 87 },
      { period: 'Q2 2024', predicted: 3520000000, confidence: 82 },
      { period: 'Q3 2024', predicted: 3680000000, confidence: 78 },
      { period: 'Q4 2024', predicted: 3850000000, confidence: 73 }
    ]

    const hotspots = [
      { area: 'Phường 1', score: 94, growth: 18.5, potential: 'Cực cao' },
      { area: 'Thắng Tam', score: 88, growth: 15.2, potential: 'Cao' },
      { area: 'Phường 2', score: 82, growth: 12.7, potential: 'Cao' },
      { area: 'Long Hải', score: 76, growth: 22.1, potential: 'Trung bình' },
      { area: 'Phường 3', score: 71, growth: 8.9, potential: 'Trung bình' }
    ]

    return {
      priceHistory,
      areaComparison,
      propertyTypes,
      marketIndicators,
      predictions,
      hotspots
    }
  }

  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setMarketData(generateMarketData())
      setIsLoading(false)
    }, 1500)
  }, [timeframe, selectedArea])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)}M`
    }
    return amount.toLocaleString()
  }

  const formatCurrencyFull = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ VNĐ`
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} triệu VNĐ`
    }
    return `${amount.toLocaleString('vi-VN')} VNĐ`
  }

  if (isLoading || !marketData) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-16 w-16 text-primary animate-pulse" />
            <h3 className="text-lg font-semibold mt-4 mb-2">Đang phân tích thị trường...</h3>
            <p className="text-muted-foreground text-center">
              Xử lý dữ liệu từ 50,000+ giao dịch bất động sản
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Market Analytics Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Thông tin thị trường BĐS Vũng Tàu theo thời gian thực
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 tháng</SelectItem>
              <SelectItem value="6months">6 tháng</SelectItem>
              <SelectItem value="12months">12 tháng</SelectItem>
              <SelectItem value="24months">24 tháng</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khu vực</SelectItem>
              <SelectItem value="phuong1">Phường 1</SelectItem>
              <SelectItem value="phuong2">Phường 2</SelectItem>
              <SelectItem value="thangtam">Thắng Tam</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Giá trung bình</p>
                <p className="text-2xl font-bold">{formatCurrencyFull(marketData.marketIndicators.averagePrice)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    +{marketData.marketIndicators.priceChange}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Giao dịch</p>
                <p className="text-2xl font-bold">{marketData.marketIndicators.salesVolume.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">
                    +{marketData.marketIndicators.volumeChange}%
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
                <p className="text-sm text-muted-foreground">Thời gian bán</p>
                <p className="text-2xl font-bold">{marketData.marketIndicators.daysOnMarket} ngày</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    {marketData.marketIndicators.domChange}%
                  </span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tồn kho</p>
                <p className="text-2xl font-bold">{marketData.marketIndicators.inventory.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">
                    {marketData.marketIndicators.inventoryChange}%
                  </span>
                </div>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Xu hướng giá</TabsTrigger>
          <TabsTrigger value="areas">So sánh khu vực</TabsTrigger>
          <TabsTrigger value="types">Loại BDS</TabsTrigger>
          <TabsTrigger value="predictions">Dự báo</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Biến động giá theo thời gian</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={marketData.priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value) => [formatCurrencyFull(value as number), 'Giá TB']} />
                  <Area
                    type="monotone"
                    dataKey="averagePrice"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Số lượng giao dịch</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketData.priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tồn kho thị trường</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={marketData.priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="inventory" stroke="#ff7300" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Giá trung bình theo khu vực</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={marketData.areaComparison} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatCurrency} />
                    <YAxis dataKey="area" type="category" width={80} />
                    <Tooltip formatter={(value) => [formatCurrencyFull(value as number), 'Giá TB']} />
                    <Bar dataKey="averagePrice" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tăng trưởng theo khu vực</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={marketData.areaComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Tăng trưởng']} />
                    <Bar dataKey="growth" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Hot Spots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Điểm nóng đầu tư
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketData.hotspots.map((hotspot, index) => (
                  <div key={hotspot.area} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{hotspot.area}</div>
                        <div className="text-sm text-muted-foreground">
                          Tăng trưởng: +{hotspot.growth}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{hotspot.score}/100</div>
                      <Badge variant={hotspot.potential === 'Cực cao' ? 'default' : hotspot.potential === 'Cao' ? 'secondary' : 'outline'}>
                        {hotspot.potential}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố loại BDS</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={marketData.propertyTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, value }) => `${type}: ${value}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {marketData.propertyTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tăng trưởng theo loại</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {marketData.propertyTypes.map((type, index) => (
                  <div key={type.type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      <div>
                        <div className="font-medium">{type.type}</div>
                        <div className="text-sm text-muted-foreground">{type.value}% thị trường</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">+{type.growth}%</div>
                      <div className="text-sm text-muted-foreground">YoY</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Dự báo giá BDS 2024
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={marketData.predictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value) => [formatCurrencyFull(value as number), 'Giá dự báo']} />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketData.predictions.map((pred, index) => (
              <Card key={pred.period}>
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">{pred.period}</div>
                  <div className="text-lg font-bold mt-1">{formatCurrencyFull(pred.predicted)}</div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">{pred.confidence}% tin cậy</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Xuất báo cáo thị trường</h3>
              <p className="text-muted-foreground">Tải về báo cáo chi tiết định dạng PDF/Excel</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                Xuất PDF
              </Button>
              <Button variant="outline">
                Xuất Excel
              </Button>
              <Button>
                Chia sẻ báo cáo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MarketAnalyticsDashboard