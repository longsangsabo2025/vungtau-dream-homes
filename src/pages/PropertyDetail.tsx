import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useProperty } from '../hooks/useSupabase'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useFavorite } from '@/hooks/useFavorite'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PropertyMap from '../components/PropertyMap'
import { SEO } from '../components/SEO'
import { PropertyStructuredData } from '../components/PropertyStructuredData'
import { PropertyBreadcrumb } from '../components/ui/breadcrumb-nav'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
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
  Share2,
  Heart,
  Loader2,
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


const PropertyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const { property, loading, error } = useProperty(id || '')
  const { isFavorite, loading: favoriteLoading, toggleFavorite } = useFavorite({ propertyId: id || '' })
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [contactLoading, setContactLoading] = useState(false)

  // Admin hotline number
  const ADMIN_HOTLINE = '0901234567'

  // Auto-fill user info when logged in
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, email')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setContactForm(prev => ({
            ...prev,
            name: profile.full_name || prev.name,
            email: profile.email || user.email || prev.email,
            phone: profile.phone || prev.phone
          }))
        } else {
          setContactForm(prev => ({
            ...prev,
            email: user.email || prev.email
          }))
        }
      }
      fetchUserProfile()
    }
  }, [user])

  // Validate Vietnamese phone number
  const validatePhoneVN = (phone: string): boolean => {
    // Vietnamese phone: starts with 0, 10-11 digits, or +84 format
    const vnPhoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/
    const cleanPhone = phone.replace(/[\s.-]/g, '')
    return vnPhoneRegex.test(cleanPhone) || /^(0[0-9]{9,10})$/.test(cleanPhone)
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactLoading(true)

    try {
      // Validate phone
      if (!validatePhoneVN(contactForm.phone)) {
        toast({
          title: "Số điện thoại không hợp lệ",
          description: "Vui lòng nhập số điện thoại Việt Nam hợp lệ (VD: 0912345678)",
          variant: "destructive"
        })
        setContactLoading(false)
        return
      }

      // Rate limiting: Check if user already sent inquiry today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data: existingInquiry } = await supabase
        .from('inquiries')
        .select('id')
        .eq('property_id', id)
        .eq('email', contactForm.email)
        .gte('created_at', today.toISOString())
        .single()

      if (existingInquiry) {
        toast({
          title: "Đã gửi yêu cầu",
          description: "Bạn đã gửi yêu cầu tư vấn cho BĐS này hôm nay. Chúng tôi sẽ sớm liên hệ lại.",
          variant: "destructive"
        })
        setContactLoading(false)
        return
      }

      // Save inquiry to database
      const { error: dbError } = await supabase
        .from('inquiries')
        .insert({
          property_id: id,
          user_id: user?.id || null,
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: contactForm.message || `Tôi quan tâm đến bất động sản: ${property?.title}`,
          status: 'pending',
        })

      if (dbError) throw dbError

      // Create notification for property owner
      if (property?.owner_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: property.owner_id,
            title: 'Có người quan tâm BĐS của bạn',
            message: `${contactForm.name} muốn tư vấn về "${property.title}". SĐT: ${contactForm.phone}`,
            type: 'inquiry',
            reference_id: id,
            is_read: false
          })
      }

      // Update property contact_count
      if (property) {
        await supabase
          .from('properties')
          .update({ contact_count: (property.contact_count || 0) + 1 })
          .eq('id', id)
      }

      toast({
        title: "Thành công!",
        description: "Chúng tôi đã nhận được yêu cầu của bạn và sẽ liên hệ sớm.",
      })
      setContactForm({ name: '', email: '', phone: '', message: '' })
    } catch (error: any) {
      console.error('Error submitting inquiry:', error)
      toast({
        title: "Có lỗi xảy ra",
        description: "Vui lòng thử lại sau hoặc liên hệ trực tiếp qua số điện thoại.",
        variant: "destructive"
      })
    } finally {
      setContactLoading(false)
    }
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

  // Get all images from property_images table and image_url field
  const getAllImages = () => {
    const imageList: string[] = [];
    
    // Add images from property_images (sorted by display_order, primary first)
    if (property.property_images && property.property_images.length > 0) {
      const sortedImages = [...property.property_images].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.display_order || 0) - (b.display_order || 0);
      });
      imageList.push(...sortedImages.map(img => img.image_url));
    }
    
    // Add image_url if exists and not already in list
    if (property.image_url && !imageList.includes(property.image_url)) {
      imageList.unshift(property.image_url);
    }
    
    // If no images, use placeholder
    if (imageList.length === 0) {
      imageList.push('/placeholder.svg');
    }
    
    return imageList;
  };
  
  const images = getAllImages();

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
        {/* Breadcrumb Navigation */}
        <PropertyBreadcrumb 
          propertyTitle={property.title}
          propertyType={property.type}
          className="mb-2"
        />

        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(-1)}
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
                        <div className="relative aspect-video bg-muted flex items-center justify-center">
                          <img 
                            src={img} 
                            alt={`${property.title} - ${idx + 1}`}
                            className="max-w-full max-h-full object-contain rounded-t-lg"
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
                    <Button 
                      variant={isFavorite ? "destructive" : "outline"} 
                      size="icon"
                      onClick={toggleFavorite}
                      disabled={favoriteLoading}
                    >
                      {favoriteLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      )}
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
                </form>


              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PropertyStructuredData property={property} />
      <Footer />
    </div>
  )
}

export default PropertyDetail