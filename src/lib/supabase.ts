import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for your database (you can extend these as needed)
export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          title: string
          price: number
          location: string
          bedrooms: number
          bathrooms: number
          area: number
          image_url: string
          description: string
          type: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          price: number
          location: string
          bedrooms: number
          bathrooms: number
          area: number
          image_url: string
          description: string
          type: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          price?: number
          location?: string
          bedrooms?: number
          bathrooms?: number
          area?: number
          image_url?: string
          description?: string
          type?: string
          status?: string
          updated_at?: string
        }
      }
    }
  }
}