import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'

describe('PropertyCard component', () => {
  const mockProperty = {
    id: '1',
    title: 'Beautiful Villa in Vung Tau',
    price: 5000000000,
    area: 200,
    bedrooms: 4,
    bathrooms: 3,
    location: 'Vũng Tàu',
    image_url: 'test.jpg',
    type: 'Villa',
    status: 'Hot',
  }

  it('should render property information', () => {
    render(
      <BrowserRouter>
        <PropertyCard {...mockProperty} />
      </BrowserRouter>
    )

    expect(screen.getByText('Beautiful Villa in Vung Tau')).toBeInTheDocument()
    expect(screen.getByText('Vũng Tàu')).toBeInTheDocument()
    expect(screen.getByText('Villa')).toBeInTheDocument()
    expect(screen.getByText('Hot')).toBeInTheDocument()
  })

  it('should format price correctly', () => {
    render(
      <BrowserRouter>
        <PropertyCard {...mockProperty} />
      </BrowserRouter>
    )

    expect(screen.getByText(/5\.0 tỷ VNĐ/)).toBeInTheDocument()
  })

  it('should display property details', () => {
    render(
      <BrowserRouter>
        <PropertyCard {...mockProperty} />
      </BrowserRouter>
    )

    expect(screen.getByText('200m²')).toBeInTheDocument()
    expect(screen.getByText('4 PN')).toBeInTheDocument()
    expect(screen.getByText('3 WC')).toBeInTheDocument()
  })
})