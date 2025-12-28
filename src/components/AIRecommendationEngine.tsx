import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Star, 
  Zap,
  MapPin,
  Home,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface Property {
  id: string
  title: string
  price: number
  location: string
  type: string
  bedrooms: number
  bathrooms: number
  area: number
  image_url?: string
  latitude?: number
  longitude?: number
}

interface AIScore {
  overall: number
  investment: number
  lifestyle: number
  growth: number
  risk: number
}

interface Recommendation {
  property: Property
  matchScore: number
  aiScore: AIScore
  reasons: string[]
  warnings: string[]
  prediction: {
    priceChange: number
    timeframe: string
    confidence: number
  }
}

interface UserPreferences {
  budget: [number, number]
  preferredAreas: string[]
  propertyTypes: string[]
  investmentGoal: 'rental' | 'appreciation' | 'personal'
  riskTolerance: 'low' | 'medium' | 'high'
  timeHorizon: '1-2' | '3-5' | '5+'
}

const AIRecommendationEngine = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    budget: [1000000000, 5000000000], // 1-5 billion VND
    preferredAreas: ['Phường 1', 'Phường 2', 'Thắng Tam'],
    propertyTypes: ['Căn hộ', 'Nhà phố'],
    investmentGoal: 'appreciation',
    riskTolerance: 'medium',
    timeHorizon: '3-5'
  })

  // Mock AI Analysis - In production, this would call your ML API
  const generateAIRecommendations = async () => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock property data
    const mockProperties: Property[] = [
      {
        id: '1',
        title: 'Căn hộ cao cấp view biển Thùy Vân',
        price: 3200000000,
        location: 'Phường 1, TP. Vũng Tàu',
        type: 'Căn hộ',
        bedrooms: 2,
        bathrooms: 2,
        area: 85,
        image_url: '/api/placeholder/400/300',
        latitude: 10.3360,
        longitude: 107.0948
      },
      {
        id: '2',
        title: 'Nhà phố kinh doanh đường Quang Trung',
        price: 4500000000,
        location: 'Phường 2, TP. Vũng Tàu',
        type: 'Nhà phố',
        bedrooms: 4,
        bathrooms: 3,
        area: 120,
        image_url: '/api/placeholder/400/300',
        latitude: 10.3428,
        longitude: 107.0829
      },
      {
        id: '3',
        title: 'Villa nghỉ dưỡng Long Hải',
        price: 2800000000,
        location: 'Thắng Tam, Vũng Tàu',
        type: 'Villa',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        image_url: '/api/placeholder/400/300',
        latitude: 10.3560,
        longitude: 107.0743
      }
    ]

    // Generate AI recommendations with mock ML scoring
    const aiRecommendations: Recommendation[] = mockProperties.map((property, index) => {
      // Mock AI scoring algorithm
      const baseScore = Math.random() * 30 + 70 // 70-100 range
      const investmentScore = Math.random() * 25 + 75
      const lifestyleScore = Math.random() * 20 + 80
      const growthScore = Math.random() * 30 + 65
      const riskScore = Math.random() * 40 + 50

      const reasons = []
      const warnings = []

      // Generate dynamic reasons based on property characteristics
      if (property.location.includes('Phường 1')) {
        reasons.push('Vị trí trung tâm, gần biển')
        reasons.push('Hạ tầng phát triển tốt')
      }
      
      if (property.type === 'Căn hộ') {
        reasons.push('Dễ cho thuê, thanh khoản cao')
        reasons.push('Chi phí bảo trì thấp')
      }

      if (property.price < 3500000000) {
        reasons.push('Giá cả hợp lý so với thị trường')
      }

      // Generate warnings
      if (riskScore < 60) {
        warnings.push('Khu vực có nguy cơ biến động giá')
      }

      if (property.area < 100) {
        warnings.push('Diện tích có thể hạn chế khả năng tăng giá')
      }

      return {
        property,
        matchScore: Math.min(baseScore + (index === 0 ? 15 : index === 1 ? 10 : 5), 100),
        aiScore: {
          overall: baseScore,
          investment: investmentScore,
          lifestyle: lifestyleScore,
          growth: growthScore,
          risk: riskScore
        },
        reasons: reasons.slice(0, 3),
        warnings: warnings,
        prediction: {
          priceChange: Math.random() * 15 + 5, // 5-20% increase predicted
          timeframe: '12-18 tháng',
          confidence: Math.random() * 25 + 75 // 75-100% confidence
        }
      }
    })

    // Sort by match score
    aiRecommendations.sort((a, b) => b.matchScore - a.matchScore)
    
    setRecommendations(aiRecommendations)
    setIsLoading(false)
  }

  useEffect(() => {
    generateAIRecommendations()
  }, [])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ VNĐ`
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} triệu VNĐ`
    }
    return `${amount.toLocaleString('vi-VN')} VNĐ`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <Brain className="h-16 w-16 text-primary animate-pulse" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
            </div>
            <h3 className="text-lg font-semibold mt-4 mb-2">AI đang phân tích...</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Hệ thống AI đang xử lý hơn 10,000+ dữ liệu thị trường để tìm ra 
              những bất động sản phù hợp nhất với bạn
            </p>
            <Progress value={85} className="w-64 mt-4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">AI Recommendation Engine</h2>
          <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none">
            Powered by AI
          </Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Hệ thống AI phân tích hàng nghìn yếu tố thị trường để đưa ra những khuyến nghị đầu tư thông minh nhất cho bạn
        </p>
      </div>

      {/* AI Insights Panel */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Thông tin thị trường AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">+12.5%</p>
              <p className="text-sm text-muted-foreground">Tăng giá dự báo 2024</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">94%</p>
              <p className="text-sm text-muted-foreground">Độ chính xác AI</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">15 ngày</p>
              <p className="text-sm text-muted-foreground">Thời gian bán trung bình</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="space-y-6">
        {recommendations.map((rec, index) => (
          <Card key={rec.property.id} className={`${index === 0 ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
            {index === 0 && (
              <div className="bg-primary text-primary-foreground px-4 py-2 text-center font-medium text-sm">
                🏆 Khuyến nghị hàng đầu của AI
              </div>
            )}
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Property Image */}
                <div className="lg:col-span-3">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={rec.property.image_url || '/api/placeholder/300/225'} 
                      alt={rec.property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Property Details */}
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold line-clamp-2">{rec.property.title}</h3>
                      <Badge variant="outline" className="ml-2">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {rec.matchScore.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{rec.property.location}</span>
                    </div>
                    <div className="text-2xl font-bold text-primary mb-4">
                      {formatCurrency(rec.property.price)}
                    </div>
                  </div>

                  {/* Property Features */}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      {rec.property.bedrooms} PN
                    </div>
                    <div className="flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      {rec.property.bathrooms} WC
                    </div>
                    <div className="flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      {rec.property.area} m²
                    </div>
                  </div>

                  {/* AI Reasons */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Lý do AI khuyến nghị
                    </h4>
                    <ul className="space-y-1">
                      {rec.reasons.map((reason, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Warnings */}
                  {rec.warnings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        Lưu ý
                      </h4>
                      <ul className="space-y-1">
                        {rec.warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm text-yellow-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* AI Scores */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(rec.aiScore.overall)} mb-1`}>
                      {rec.aiScore.overall.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">AI Score</div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="space-y-3">
                    {[
                      { label: 'Đầu tư', value: rec.aiScore.investment, icon: DollarSign },
                      { label: 'Sinh hoạt', value: rec.aiScore.lifestyle, icon: Home },
                      { label: 'Tăng trưởng', value: rec.aiScore.growth, icon: TrendingUp },
                      { label: 'Rủi ro', value: rec.aiScore.risk, icon: Target }
                    ].map((score, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <score.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{score.label}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getScoreColor(score.value)}`}>
                            {score.value.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Prediction */}
                  <div className="p-3 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border">
                    <div className="text-sm font-medium mb-2">Dự báo giá</div>
                    <div className="text-lg font-bold text-green-600 mb-1">
                      +{rec.prediction.priceChange.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      trong {rec.prediction.timeframe}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Độ tin cậy: {rec.prediction.confidence.toFixed(0)}%
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to={`/property/${rec.property.id}`}>
                        Xem chi tiết
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full">
                      Lưu yêu thích
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={generateAIRecommendations}
          disabled={isLoading}
        >
          {isLoading ? 'Đang phân tích...' : 'Xem thêm khuyến nghị'}
        </Button>
      </div>
    </div>
  )
}

export default AIRecommendationEngine