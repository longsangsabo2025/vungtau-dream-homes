import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { 
  Calculator, 
  TrendingUp, 
  PiggyBank, 
  Building, 
  DollarSign,
  BarChart3,
  Target,
  Wallet
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface MortgageResult {
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  schedule: Array<{
    month: number
    payment: number
    principal: number
    interest: number
    balance: number
  }>
}

interface ROIResult {
  monthlyRental: number
  annualRental: number
  grossYield: number
  netYield: number
  totalReturn: number
  paybackPeriod: number
}

const FinancialCalculators = () => {
  const [activeTab, setActiveTab] = useState('mortgage')
  
  // Mortgage Calculator State
  const [mortgage, setMortgage] = useState({
    loanAmount: 2000000000, // 2 billion VND
    interestRate: 8.5, // Annual %
    loanTerm: 20, // years
    downPayment: 500000000 // 500 million VND
  })
  const [mortgageResult, setMortgageResult] = useState<MortgageResult | null>(null)

  // ROI Calculator State  
  const [roi, setRoi] = useState({
    propertyPrice: 3000000000, // 3 billion VND
    monthlyRent: 15000000, // 15 million VND/month
    monthlyExpenses: 2000000, // 2 million VND/month
    initialInvestment: 600000000, // 600 million VND
    appreciationRate: 5 // Annual %
  })
  const [roiResult, setRoiResult] = useState<ROIResult | null>(null)

  // Affordability Calculator State
  const [affordability, setAffordability] = useState({
    monthlyIncome: 50000000, // 50 million VND/month
    monthlyExpenses: 15000000, // 15 million VND/month
    downPaymentSavings: 800000000, // 800 million VND
    debtToIncomeRatio: 30 // %
  })
  const [affordablePrice, setAffordablePrice] = useState<number>(0)

  // Calculate Mortgage
  const calculateMortgage = () => {
    const principal = mortgage.loanAmount - mortgage.downPayment
    const monthlyRate = mortgage.interestRate / 100 / 12
    const numPayments = mortgage.loanTerm * 12
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1)
    
    const totalPayment = monthlyPayment * numPayments + mortgage.downPayment
    const totalInterest = totalPayment - mortgage.loanAmount
    
    // Generate payment schedule (first 12 months for chart)
    const schedule = []
    let balance = principal
    
    for (let month = 1; month <= Math.min(numPayments, 12); month++) {
      const interestPayment = balance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      balance -= principalPayment
      
      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(balance, 0)
      })
    }
    
    setMortgageResult({
      monthlyPayment,
      totalInterest,
      totalPayment,
      schedule
    })
  }

  // Calculate ROI
  const calculateROI = () => {
    const annualRental = roi.monthlyRent * 12
    const annualExpenses = roi.monthlyExpenses * 12
    const netAnnualRental = annualRental - annualExpenses
    
    const grossYield = (annualRental / roi.propertyPrice) * 100
    const netYield = (netAnnualRental / roi.propertyPrice) * 100
    
    // 5-year projection with appreciation
    const totalReturn = netAnnualRental * 5 + 
                       (roi.propertyPrice * Math.pow(1 + roi.appreciationRate / 100, 5) - roi.propertyPrice)
    
    const paybackPeriod = roi.initialInvestment / netAnnualRental
    
    setRoiResult({
      monthlyRental: roi.monthlyRent - roi.monthlyExpenses,
      annualRental: netAnnualRental,
      grossYield,
      netYield,
      totalReturn,
      paybackPeriod
    })
  }

  // Calculate Affordability
  const calculateAffordability = () => {
    const availableIncome = affordability.monthlyIncome - affordability.monthlyExpenses
    const maxMonthlyPayment = availableIncome * (affordability.debtToIncomeRatio / 100)
    
    // Assume 20-year loan at 8.5% interest
    const monthlyRate = 0.085 / 12
    const numPayments = 20 * 12
    
    const maxLoanAmount = maxMonthlyPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) /
                         (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
    
    const affordablePrice = maxLoanAmount + affordability.downPaymentSavings
    setAffordablePrice(affordablePrice)
  }

  useEffect(() => {
    calculateMortgage()
  }, [mortgage])

  useEffect(() => {
    calculateROI()
  }, [roi])

  useEffect(() => {
    calculateAffordability()
  }, [affordability])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ VNĐ`
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} triệu VNĐ`
    }
    return `${amount.toLocaleString('vi-VN')} VNĐ`
  }

  const formatNumber = (num: number, decimals: number = 1) => {
    return num.toFixed(decimals)
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="text-center space-y-2 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center justify-center gap-2">
          <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          Công cụ tính toán tài chính
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          Công cụ chuyên nghiệp giúp bạn đưa ra quyết định đầu tư thông minh
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="mortgage" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 sm:py-2">
            <Building className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Vay mua nhà</span>
          </TabsTrigger>
          <TabsTrigger value="roi" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 sm:py-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs sm:text-sm">ROI đầu tư</span>
          </TabsTrigger>
          <TabsTrigger value="affordability" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 sm:py-2">
            <Wallet className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Khả năng mua</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 sm:py-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs sm:text-sm">So sánh vay</span>
          </TabsTrigger>
        </TabsList>

        {/* MORTGAGE CALCULATOR */}
        <TabsContent value="mortgage" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                  Thông tin khoản vay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Giá bất động sản</Label>
                  <Input
                    type="number"
                    value={mortgage.loanAmount}
                    onChange={(e) => setMortgage({...mortgage, loanAmount: Number(e.target.value)})}
                    placeholder="VND"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Trả trước ({((mortgage.downPayment / mortgage.loanAmount) * 100).toFixed(1)}%)</Label>
                  <Input
                    type="number"
                    value={mortgage.downPayment}
                    onChange={(e) => setMortgage({...mortgage, downPayment: Number(e.target.value)})}
                    placeholder="VND"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Lãi suất (%/năm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={mortgage.interestRate}
                    onChange={(e) => setMortgage({...mortgage, interestRate: Number(e.target.value)})}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Thời hạn vay (năm)</Label>
                  <Select value={mortgage.loanTerm.toString()} onValueChange={(value) => setMortgage({...mortgage, loanTerm: Number(value)})}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 năm</SelectItem>
                      <SelectItem value="15">15 năm</SelectItem>
                      <SelectItem value="20">20 năm</SelectItem>
                      <SelectItem value="25">25 năm</SelectItem>
                      <SelectItem value="30">30 năm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
                  Kết quả tính toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mortgageResult && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Trả hàng tháng</p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(mortgageResult.monthlyPayment)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Tổng lãi phải trả</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(mortgageResult.totalInterest)}
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vay thực tế:</span>
                        <span className="font-medium">{formatCurrency(mortgage.loanAmount - mortgage.downPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tổng thanh toán:</span>
                        <span className="font-medium">{formatCurrency(mortgageResult.totalPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tiết kiệm được nếu trả trước:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(mortgageResult.totalInterest * 0.3)}
                        </span>
                      </div>
                    </div>

                    {mortgageResult.schedule.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-3">Biểu đồ thanh toán 12 tháng đầu</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={mortgageResult.schedule}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(value) => `${(value/1000000).toFixed(0)}M`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Line type="monotone" dataKey="principal" stroke="#2563eb" name="Gốc" />
                            <Line type="monotone" dataKey="interest" stroke="#dc2626" name="Lãi" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ROI CALCULATOR */}
        <TabsContent value="roi" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  Thông tin đầu tư
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Giá mua BĐS</Label>
                  <Input
                    type="number"
                    value={roi.propertyPrice}
                    onChange={(e) => setRoi({...roi, propertyPrice: Number(e.target.value)})}
                    placeholder="VND"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Thu nhập thuê/tháng</Label>
                  <Input
                    type="number"
                    value={roi.monthlyRent}
                    onChange={(e) => setRoi({...roi, monthlyRent: Number(e.target.value)})}
                    placeholder="VND"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Chi phí/tháng</Label>
                  <Input
                    type="number"
                    value={roi.monthlyExpenses}
                    onChange={(e) => setRoi({...roi, monthlyExpenses: Number(e.target.value)})}
                    placeholder="VND"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Vốn ban đầu</Label>
                  <Input
                    type="number"
                    value={roi.initialInvestment}
                    onChange={(e) => setRoi({...roi, initialInvestment: Number(e.target.value)})}
                    placeholder="VND"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tăng giá dự kiến (%/năm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={roi.appreciationRate}
                    onChange={(e) => setRoi({...roi, appreciationRate: Number(e.target.value)})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Phân tích ROI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {roiResult && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-muted-foreground">Lợi nhuận/tháng</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(roiResult.monthlyRental)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-muted-foreground">Tỷ suất thuần</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatNumber(roiResult.netYield)}%
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tỷ suất gваловой:</span>
                        <Badge variant="outline">{formatNumber(roiResult.grossYield)}%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Thu nhập/năm:</span>
                        <span className="font-medium">{formatCurrency(roiResult.annualRental)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hoàn vốn sau:</span>
                        <Badge variant="secondary">{formatNumber(roiResult.paybackPeriod)} năm</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tổng lợi nhuận 5 năm:</span>
                        <span className="font-bold text-green-600">{formatCurrency(roiResult.totalReturn)}</span>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Đánh giá đầu tư</span>
                      </div>
                      {roiResult.netYield >= 8 ? (
                        <p className="text-green-700 text-sm">✅ Đầu tư tốt! Tỷ suất lợi nhuận cao</p>
                      ) : roiResult.netYield >= 5 ? (
                        <p className="text-yellow-700 text-sm">⚠️ Đầu tư khá ổn, cân nhắc thêm</p>
                      ) : (
                        <p className="text-red-700 text-sm">❌ Tỷ suất thấp, nên xem xét lại</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AFFORDABILITY CALCULATOR */}
        <TabsContent value="affordability" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Thông tin tài chính cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Thu nhập/tháng</Label>
                  <Input
                    type="number"
                    value={affordability.monthlyIncome}
                    onChange={(e) => setAffordability({...affordability, monthlyIncome: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chi phí sinh hoạt/tháng</Label>
                  <Input
                    type="number"
                    value={affordability.monthlyExpenses}
                    onChange={(e) => setAffordability({...affordability, monthlyExpenses: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tiền tiết kiệm (trả trước)</Label>
                  <Input
                    type="number"
                    value={affordability.downPaymentSavings}
                    onChange={(e) => setAffordability({...affordability, downPaymentSavings: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tỷ lệ nợ/thu nhập (%)</Label>
                  <Select 
                    value={affordability.debtToIncomeRatio.toString()} 
                    onValueChange={(value) => setAffordability({...affordability, debtToIncomeRatio: Number(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20% (An toàn)</SelectItem>
                      <SelectItem value="30">30% (Khuyến nghị)</SelectItem>
                      <SelectItem value="40">40% (Cao)</SelectItem>
                      <SelectItem value="50">50% (Rủi ro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  Khả năng mua nhà
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">Bạn có thể mua BĐS trị giá</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(affordablePrice)}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thu nhập khả dụng:</span>
                    <span className="font-medium">
                      {formatCurrency(affordability.monthlyIncome - affordability.monthlyExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trả góp tối đa/tháng:</span>
                    <span className="font-medium">
                      {formatCurrency((affordability.monthlyIncome - affordability.monthlyExpenses) * affordability.debtToIncomeRatio / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vay tối đa:</span>
                    <span className="font-medium">
                      {formatCurrency(affordablePrice - affordability.downPaymentSavings)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-amber-800">Lời khuyên</span>
                  </div>
                  <p className="text-amber-700 text-sm">
                    Nên để dự phòng 10-15% tổng giá trị BĐS cho các chi phí phát sinh 
                    (thuế, phí, sửa chữa, nội thất).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* LOAN COMPARISON */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                So sánh gói vay từ các ngân hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { bank: 'Vietcombank', rate: 8.2, promotion: '6.5% trong 6 tháng đầu' },
                  { bank: 'BIDV', rate: 8.5, promotion: 'Miễn phí thẩm định' },
                  { bank: 'VietinBank', rate: 8.0, promotion: '7.0% trong 12 tháng đầu' }
                ].map((loan, idx) => (
                  <div key={idx} className="p-4 border rounded-lg space-y-3">
                    <div className="font-medium text-lg">{loan.bank}</div>
                    <div className="text-2xl font-bold text-primary">{loan.rate}%</div>
                    <div className="text-sm text-muted-foreground">{loan.promotion}</div>
                    <Button variant="outline" className="w-full">Chọn gói này</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FinancialCalculators