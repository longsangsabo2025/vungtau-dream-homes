import { useState, useEffect } from 'react'
import { supabase, type Database } from '../lib/supabase'

type Property = Database['public']['Tables']['properties']['Row']

interface UsePropertiesOptions {
  page?: number
  pageSize?: number
  searchQuery?: string
  typeFilter?: string
  statusFilter?: string
}

export function useProperties(options: UsePropertiesOptions = {}) {
  const { 
    page = 1, 
    pageSize = 12, 
    searchQuery = '', 
    typeFilter = '', 
    statusFilter = '' 
  } = options

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchProperties()
  }, [page, pageSize, searchQuery, typeFilter, statusFilter])

  async function fetchProperties() {
    try {
      setLoading(true)
      setError(null)

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('approval_status', 'approved') // Chỉ hiển thị tin đã duyệt
        .order('created_at', { ascending: false })
        .range(from, to)

      // Apply filters
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
      }
      if (typeFilter) {
        query = query.eq('type', typeFilter)
      }
      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data, error, count } = await query

      if (error) throw error

      setProperties(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  async function addProperty(property: Database['public']['Tables']['properties']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([property])
        .select()

      if (error) throw error

      if (data) {
        setProperties(prev => [data[0], ...prev])
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  async function updateProperty(id: string, updates: Database['public']['Tables']['properties']['Update']) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      if (data) {
        setProperties(prev => 
          prev.map(property => 
            property.id === id ? { ...property, ...data[0] } : property
          )
        )
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  async function deleteProperty(id: string) {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProperties(prev => prev.filter(property => property.id !== id))

      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  return {
    properties,
    loading,
    error,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
    fetchProperties,
    addProperty,
    updateProperty,
    deleteProperty
  }
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchProperty(id)
    }
  }, [id])

  async function fetchProperty(propertyId: string) {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (error) throw error

      setProperty(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Property not found')
      console.error('Error fetching property:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    property,
    loading,
    error,
    refetch: () => fetchProperty(id)
  }
}