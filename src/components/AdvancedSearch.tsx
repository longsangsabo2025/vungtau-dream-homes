import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Slider } from './ui/slider'
import { Badge } from './ui/badge'
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  MapPin,
  Bed,
  Bath,
  Maximize,
  DollarSign
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

interface SearchFilters {
  query: string
  type: string
  priceRange: [number, number]
  areaRange: [number, number]
  bedrooms: string
  bathrooms: string
  location: string
  status: string
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  className?: string
}

const AdvancedSearch = ({ onFiltersChange, className = '' }: AdvancedSearchProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: '',
    priceRange: [0, 50000000000], // 50 billion VND max
    areaRange: [0, 1000], // 1000m2 max
    bedrooms: '',
    bathrooms: '',
    location: '',
    status: ''
  })

  const propertyTypes = ['Villa', 'Căn hộ', 'Nhà phố', 'Đất nền', 'Biệt thự', 'Shophouse', 'Studio', 'Condotel', 'Đất thổ cư']
  const locations = [
    'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5',
    'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12',
    'Thắng Tam', 'Thắng Nhì', 'Thắng Nhất', 'Long Sơn', 'Nguyễn An Ninh'
  ]
  const statusOptions = ['Có sẵn', 'Hot', 'Nổi bật', 'Đã bán']

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    const resetFilters = {
      query: '',
      type: '',
      priceRange: [0, 50000000000] as [number, number],
      areaRange: [0, 1000] as [number, number],
      bedrooms: '',
      bathrooms: '',
      location: '',
      status: ''
    }
    setFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`
    }
    return `${price.toLocaleString('vi-VN')}`
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.query) count++
    if (filters.type) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000000000) count++
    if (filters.areaRange[0] > 0 || filters.areaRange[1] < 1000) count++
    if (filters.bedrooms) count++
    if (filters.bathrooms) count++
    if (filters.location) count++
    if (filters.status) count++
    return count
  }

  return (
    <div className={className}>
      {/* Quick Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc địa điểm..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
              {getActiveFiltersCount() > 0 && (
                <Badge variant="destructive" className="ml-1 px-1 min-w-[16px] h-5">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tìm kiếm nâng cao</DialogTitle>
              <DialogDescription>
                Sử dụng các bộ lọc để tìm bất động sản phù hợp
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Property Type & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Loại bất động sản
                  </Label>
                  <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      {propertyTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Vị trí</Label>
                  <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khu vực" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Khoảng giá
                </Label>
                <div className="px-3">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                    max={50000000000}
                    min={0}
                    step={1000000}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatPrice(filters.priceRange[0])} VNĐ</span>
                  <span>{formatPrice(filters.priceRange[1])} VNĐ</span>
                </div>
              </div>

              {/* Area Range */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Maximize className="h-4 w-4" />
                  Diện tích (m²)
                </Label>
                <div className="px-3">
                  <Slider
                    value={filters.areaRange}
                    onValueChange={(value) => updateFilter('areaRange', value as [number, number])}
                    max={1000}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{filters.areaRange[0]} m²</span>
                  <span>{filters.areaRange[1]} m²</span>
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    Phòng ngủ
                  </Label>
                  <Select value={filters.bedrooms} onValueChange={(value) => updateFilter('bedrooms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn số phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Không quan trọng</SelectItem>
                      <SelectItem value="1">1 phòng</SelectItem>
                      <SelectItem value="2">2 phòng</SelectItem>
                      <SelectItem value="3">3 phòng</SelectItem>
                      <SelectItem value="4">4 phòng</SelectItem>
                      <SelectItem value="5">5+ phòng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Bath className="h-4 w-4" />
                    Phòng tắm
                  </Label>
                  <Select value={filters.bathrooms} onValueChange={(value) => updateFilter('bathrooms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn số phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Không quan trọng</SelectItem>
                      <SelectItem value="1">1 phòng</SelectItem>
                      <SelectItem value="2">2 phòng</SelectItem>
                      <SelectItem value="3">3 phòng</SelectItem>
                      <SelectItem value="4">4+ phòng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsOpen(false)} className="flex-1">
                  Áp dụng bộ lọc
                </Button>
                <Button variant="outline" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.type && (
            <Badge variant="secondary" className="gap-1">
              Loại: {filters.type}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('type', '')} />
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              Vị trí: {filters.location}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('location', '')} />
            </Badge>
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 50000000000) && (
            <Badge variant="secondary" className="gap-1">
              Giá: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('priceRange', [0, 50000000000])} />
            </Badge>
          )}
          {(filters.areaRange[0] > 0 || filters.areaRange[1] < 1000) && (
            <Badge variant="secondary" className="gap-1">
              Diện tích: {filters.areaRange[0]} - {filters.areaRange[1]} m²
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('areaRange', [0, 1000])} />
            </Badge>
          )}
          {filters.bedrooms && (
            <Badge variant="secondary" className="gap-1">
              {filters.bedrooms} phòng ngủ
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('bedrooms', '')} />
            </Badge>
          )}
          {filters.bathrooms && (
            <Badge variant="secondary" className="gap-1">
              {filters.bathrooms} phòng tắm
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('bathrooms', '')} />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              {filters.status}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('status', '')} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch