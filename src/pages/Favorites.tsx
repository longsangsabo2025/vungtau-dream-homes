import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Bất động sản yêu thích</h1>
            <p className="text-muted-foreground">
              {favorites.length} tin đăng đã lưu
            </p>
          </div>

          {/* Empty State */}
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => {
                const property = favorite.properties
                if (!property) return null

                return (
                  <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video">
                      <img
                        src={property.image_url || '/placeholder.jpg'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge 
                        className="absolute top-3 left-3"
                        variant={property.status === 'Hot' ? 'destructive' : 'secondary'}
                      >
                        {property.status}
                      </Badge>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-3 right-3"
                        onClick={() => removeFavorite(favorite.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="line-clamp-1">{property.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                        {property.area && (
                          <div className="flex items-center gap-1">
                            <Maximize className="h-4 w-4" />
                            <span>{property.area}m²</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            {property.price?.toLocaleString()} VNĐ
                          </p>
                          {property.view_count > 0 && (
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Eye className="h-3 w-3 mr-1" />
                              {property.view_count} lượt xem
                            </div>
                          )}
                        </div>
                        <Button size="sm" asChild>
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
      
      <Footer />
    </div>
  )
}
