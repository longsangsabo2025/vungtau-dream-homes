import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface UseFavoriteOptions {
  propertyId: string
}

export function useFavorite({ propertyId }: UseFavoriteOptions) {
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [favoriteId, setFavoriteId] = useState<string | null>(null)

  // Check if property is favorited
  useEffect(() => {
    if (!user || !propertyId) return

    const checkFavorite = async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle()

      if (!error && data) {
        setIsFavorite(true)
        setFavoriteId(data.id)
      } else {
        setIsFavorite(false)
        setFavoriteId(null)
      }
    }

    checkFavorite()
  }, [user, propertyId])

  const toggleFavorite = useCallback(async (e?: React.MouseEvent) => {
    // Prevent click from bubbling to parent (card click)
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }

    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu yêu thích')
      return
    }

    if (loading) return

    setLoading(true)

    try {
      if (isFavorite && favoriteId) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', favoriteId)

        if (error) throw error

        setIsFavorite(false)
        setFavoriteId(null)
        toast.success('Đã xóa khỏi yêu thích')
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            property_id: propertyId
          })
          .select('id')
          .single()

        if (error) {
          // Check if already exists
          if (error.code === '23505') {
            toast.info('Đã có trong danh sách yêu thích')
            return
          }
          throw error
        }

        setIsFavorite(true)
        setFavoriteId(data.id)
        toast.success('Đã thêm vào yêu thích')
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error)
      toast.error('Không thể cập nhật yêu thích')
    } finally {
      setLoading(false)
    }
  }, [user, propertyId, isFavorite, favoriteId, loading])

  return {
    isFavorite,
    loading,
    toggleFavorite
  }
}

// Hook to get all user favorites (list of property IDs)
export function useFavorites() {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set())
      setLoading(false)
      return
    }

    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id)

      if (!error && data) {
        setFavoriteIds(new Set(data.map(f => f.property_id)))
      }
      setLoading(false)
    }

    fetchFavorites()

    // Subscribe to changes
    const channel = supabase
      .channel('favorites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchFavorites()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const isFavorite = useCallback((propertyId: string) => {
    return favoriteIds.has(propertyId)
  }, [favoriteIds])

  const toggleFavorite = useCallback(async (propertyId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }

    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu yêu thích')
      return
    }

    try {
      if (favoriteIds.has(propertyId)) {
        // Remove
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId)

        if (error) throw error

        setFavoriteIds(prev => {
          const next = new Set(prev)
          next.delete(propertyId)
          return next
        })
        toast.success('Đã xóa khỏi yêu thích')
      } else {
        // Add
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            property_id: propertyId
          })

        if (error) {
          if (error.code === '23505') {
            toast.info('Đã có trong danh sách yêu thích')
            return
          }
          throw error
        }

        setFavoriteIds(prev => new Set([...prev, propertyId]))
        toast.success('Đã thêm vào yêu thích')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Không thể cập nhật yêu thích')
    }
  }, [user, favoriteIds])

  return {
    favoriteIds,
    loading,
    isFavorite,
    toggleFavorite
  }
}
