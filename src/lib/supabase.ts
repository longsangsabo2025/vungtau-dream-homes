import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'EXISTS' : 'MISSING')
  console.error('All env vars:', import.meta.env)
  throw new Error('Missing Supabase environment variables. Please check your .env file and restart the dev server.')
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