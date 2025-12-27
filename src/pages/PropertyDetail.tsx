import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useProperty } from '../hooks/useSupabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PropertyMap from '../components/PropertyMap'
import LiveChat from '../components/LiveChat'
import { SEO } from '../components/SEO'
import { PropertyStructuredData } from '../components/PropertyStructuredData'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  Bed, 
  Bath, 
  Maximize, 
  MapPin, 
  Phone, 
  Mail, 
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Link as LinkIcon
} from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const PropertyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { property, loading, error } = useProperty(id || '')
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [contactLoading, setContactLoading] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactLoading(true)

    // Simulate sending contact form
    setTimeout(() => {
      toast({
        title: "Thành công!",
        description: "Chúng tôi đã nhận được yêu cầu của bạn và sẽ liên hệ sớm.",
      })
      setContactForm({ name: '', email: '', phone: '', message: '' })
      setContactLoading(false)
    }, 1000)
  }

  const handleShare = (platform: 'facebook' | 'twitter' | 'copy') => {
    const url = window.location.href
    const title = property?.title || 'Bất động sản'

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        toast({
          title: "Đã sao chép!",
          description: "Đường dẫn đã được sao chép vào clipboard.",
        })
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg">Đang tải...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg mb-4">Không tìm thấy bất động sản</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Mock images - replace with actual property images
  const images = property.image_url 
    ? [property.image_url, property.image_url, property.image_url] 
    : ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg']

  const pageTitle = `${property.title} - ${property.location} | VungTauLand`
  const pageDescription = `${property.type} ${property.title} tại ${property.location}, Vũng Tàu. Diện tích ${property.area}m², ${property.bedrooms} phòng ngủ, ${property.bathrooms} phòng tắm. Giá ${property.listing_type === 'sale' ? 'bán' : 'thuê'}: ${property.price?.toLocaleString('vi-VN')} ${property.listing_type === 'sale' ? 'VNĐ' : 'VNĐ/tháng'}. Liên hệ ngay để xem nhà!`
  const pageKeywords = `${property.type} ${property.location}, bất động sản ${property.location}, ${property.listing_type === 'sale' ? 'mua bán' : 'cho thuê'} ${property.type}, ${property.bedrooms} phòng ngủ, ${property.bathrooms} phòng tắm, ${property.area}m2, vũng tàu`
  const pageUrl = `https://vungtauland.com/property/${property.id}`

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        url={pageUrl}
        canonical={pageUrl}
        image={property.image_url || '/og-image.jpg'}
        type="article"
        price={property.price}
        propertyType={property.type}
        bedrooms={property.bedrooms}
        bathrooms={property.bathrooms}
        area={property.area}
        location={property.location}
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <Carousel className="w-full">
                  <CarouselContent>
                    {images.map((img, idx) => (
                      <CarouselItem key={idx}>
                        <div className="relative aspect-video">
                          <img 
                            src={img} 
                            alt={`${property.title} - ${idx + 1}`}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
              </CardContent>
            </Card>

            {/* Property Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={property.status === 'Hot' ? 'destructive' : 'secondary'}>
                        {property.status}
                      </Badge>
                      <Badge variant="outline">{property.type}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Chia sẻ</DialogTitle>
                          <DialogDescription>
                            Chia sẻ bất động sản này với bạn bè
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-2">
                          <Button onClick={() => handleShare('facebook')} className="flex-1">
                            <Facebook className="mr-2 h-4 w-4" />
                            Facebook
                          </Button>
                          <Button onClick={() => handleShare('twitter')} className="flex-1">
                            <Twitter className="mr-2 h-4 w-4" />
                            Twitter
                          </Button>
                          <Button onClick={() => handleShare('copy')} className="flex-1">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Sao chép
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="text-3xl font-bold text-primary">
                  {property.price?.toLocaleString('vi-VN')} VNĐ
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{property.bedrooms}</div>
                      <div className="text-sm text-muted-foreground">Phòng ngủ</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{property.bathrooms}</div>
                      <div className="text-sm text-muted-foreground">Phòng tắm</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{property.area} m²</div>
                      <div className="text-sm text-muted-foreground">Diện tích</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-3">Mô tả</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description || 'Chưa có mô tả chi tiết.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Vị trí</h2>
                <PropertyMap
                  latitude={property.latitude || 10.3460}
                  longitude={property.longitude || 107.0843}
                  title={property.title}
                  address={property.location}
                  price={`${property.price?.toLocaleString('vi-VN')} VNĐ`}
                  height="400px"
                />
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{property.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Liên hệ tư vấn</h2>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên *</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      required
                      placeholder="0912345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Lời nhắn</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Tôi quan tâm đến bất động sản này..."
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={contactLoading}>
                    {contactLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </Button>
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" className="flex-1">
                      <Phone className="mr-2 h-4 w-4" />
                      Gọi ngay
                    </Button>
                    <Button type="button" variant="outline" className="flex-1">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PropertyStructuredData property={property} />
      <Footer />
      <LiveChat 
        propertyId={property.id}
        recipientName="Chuyên viên tư vấn"
      />
    </div>
  )
}

export default PropertyDetail