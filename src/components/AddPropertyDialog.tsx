import { useState } from 'react'
import { useProperties } from '../hooks/useSupabase'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Plus, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '../lib/supabase'

type PropertyInsert = Database['public']['Tables']['properties']['Insert']

const AddPropertyDialog = () => {
  const { addProperty } = useProperties()
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<PropertyInsert>({
    title: '',
    price: 0,
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    image_url: '',
    description: '',
    type: '',
    status: 'Có sẵn'
  })

  const propertyTypes = [
    'Villa',
    'Căn hộ',
    'Nhà phố',
    'Đất nền',
    'Biệt thự',
    'Shophouse',
    'Studio',
    'Nhà mặt tiền',
    'Condotel',
    'Đất thổ cư'
  ]

  const statusOptions = [
    'Có sẵn',
    'Hot',
    'Nổi bật',
    'Đã bán'
  ]

  const handleInputChange = (field: keyof PropertyInsert, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title || !formData.location || !formData.type || !formData.image_url) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive"
      })
      return
    }

    if (formData.price <= 0 || formData.area <= 0) {
      toast({
        title: "Lỗi", 
        description: "Giá bán và diện tích phải lớn hơn 0",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const result = await addProperty(formData)
      
      if (result.error) {
        toast({
          title: "Lỗi",
          description: result.error,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Thành công",
          description: "Đã thêm bất động sản mới"
        })
        setOpen(false)
        // Reset form
        setFormData({
          title: '',
          price: 0,
          location: '',
          bedrooms: 0,
          bathrooms: 0,
          area: 0,
          image_url: '',
          description: '',
          type: '',
          status: 'Có sẵn'
        })
      }
    } catch (error) {
      console.error('Error adding property:', error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi thêm bất động sản",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="gap-2"
          disabled={!user}
          title={!user ? "Vui lòng đăng nhập để thêm bất động sản" : "Thêm bất động sản mới"}
        >
          <Plus className="h-4 w-4" />
          Thêm BDS
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm Bất Động Sản Mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để thêm bất động sản mới vào hệ thống
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ví dụ: Villa biển view tuyệt đẹp"
                required
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Giá bán (VNĐ) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number.parseInt(e.target.value) || 0)}
                placeholder="8500000000"
                required
              />
            </div>

            {/* Area */}
            <div>
              <Label htmlFor="area">Diện tích (m²) *</Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => handleInputChange('area', Number.parseInt(e.target.value) || 0)}
                placeholder="250"
                required
              />
            </div>

            {/* Bedrooms */}
            <div>
              <Label htmlFor="bedrooms">Số phòng ngủ</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', Number.parseInt(e.target.value) || 0)}
                placeholder="4"
              />
            </div>

            {/* Bathrooms */}
            <div>
              <Label htmlFor="bathrooms">Số phòng tắm</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', Number.parseInt(e.target.value) || 0)}
                placeholder="3"
              />
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <Label htmlFor="location">Địa chỉ *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Bãi Trước, Vũng Tàu"
                required
              />
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="type">Loại bất động sản *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại BDS" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <Label htmlFor="image_url">Link ảnh *</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về bất động sản..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Thêm BDS
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddPropertyDialog