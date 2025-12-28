import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import UserLayout from '@/components/UserLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MapPin, Bed, Bath, Maximize, Eye, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Favorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          property_id,
          properties (
            id,
            title,
            price,
            location,
            bedrooms,
            bathrooms,
            area,
            image_url,
            type,
            status,
            view_count
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFavorites(data || [])
    } catch (error: any) {
      toast.error('Lỗi khi tải danh sách yêu thích')
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)

      if (error) throw error
      
      setFavorites(favorites.filter(f => f.id !== favoriteId))
      toast.success('Đã xóa khỏi danh sách yêu thích')
    } catch (error: any) {
      toast.error('Lỗi khi xóa')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <UserLayout>
      <main className="flex-1 bg-muted/30 py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Bất động sản yêu thích</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {favorites.length} tin đăng đã lưu
            </p>
          </div>

          {/* Empty State */}
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Chưa có tin đăng yêu thích</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Bắt đầu khám phá và lưu những BĐS ưng ý của bạn
                </p>
                <Button asChild>
                  <Link to="/">
                    Khám phá ngay
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Favorites Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favorites.map((favorite) => {
                const property = favorite.properties
                if (!property) return null

                return (
                  <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video bg-muted flex items-center justify-center">
                      <img
                        src={property.image_url || '/placeholder.jpg'}
                        alt={property.title}
                        className="max-w-full max-h-full object-contain"
                      />
                      <Badge 
                        className="absolute top-2 sm:top-3 left-2 sm:left-3 text-xs"
                        variant={property.status === 'Hot' ? 'destructive' : 'secondary'}
                      >
                        {property.status}
                      </Badge>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 sm:top-3 right-2 sm:right-3 h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => removeFavorite(favorite.id)}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{property.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                        {property.area && (
                          <div className="flex items-center gap-1">
                            <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{property.area}m²</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-lg sm:text-2xl font-bold text-primary">
                            {property.price?.toLocaleString()} VNĐ
                          </p>
                          {property.view_count > 0 && (
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Eye className="h-3 w-3 mr-1" />
                              {property.view_count} lượt xem
                            </div>
                          )}
                        </div>
                        <Button size="sm" asChild className="w-full sm:w-auto">
                          <Link to={`/property/${property.id}`}>
                            Xem chi tiết
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </UserLayout>
  )
}
