import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProperties, useProperty } from '../hooks/useSupabase'

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() => Promise.resolve({
            data: [
              {
                id: '1',
                title: 'Test Property',
                price: 1000000,
                location: 'Test Location',
                type: 'Villa',
                status: 'Có sẵn',
                area: 100,
                bedrooms: 3,
                bathrooms: 2,
                image_url: 'test.jpg',
                description: 'Test description',
                created_at: new Date().toISOString(),
              },
            ],
            error: null,
            count: 1,
          })),
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: '1',
              title: 'Test Property',
              price: 1000000,
              location: 'Test Location',
              type: 'Villa',
              status: 'Có sẵn',
              area: 100,
              bedrooms: 3,
              bathrooms: 2,
              image_url: 'test.jpg',
              description: 'Test description',
              created_at: new Date().toISOString(),
            },
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({
          data: [{
            id: '2',
            title: 'New Property',
            price: 2000000,
          }],
          error: null,
        })),
      })),
    })),
  },
}))

describe('useProperties hook', () => {
  it('should fetch properties successfully', async () => {
    const { result } = renderHook(() => useProperties())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.properties).toHaveLength(1)
    expect(result.current.properties[0].title).toBe('Test Property')
    expect(result.current.error).toBeNull()
  })

  it('should return pagination info', async () => {
    const { result } = renderHook(() => useProperties({ page: 1, pageSize: 12 }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.totalCount).toBe(1)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.currentPage).toBe(1)
  })
})

describe('useProperty hook', () => {
  it('should fetch a single property', async () => {
    const { result } = renderHook(() => useProperty('1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.property).toBeDefined()
    expect(result.current.property?.title).toBe('Test Property')
    expect(result.current.error).toBeNull()
  })
})