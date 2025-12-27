import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface PropertyMapProps {
  latitude: number
  longitude: number
  title?: string
  address?: string
  price?: string
  className?: string
  height?: string
}

const PropertyMap = ({ 
  latitude, 
  longitude, 
  title, 
  address, 
  price,
  className = '',
  height = '400px' 
}: PropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Create map
    const map = L.map(mapRef.current).setView([latitude, longitude], 15)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    // Create custom popup content
    const popupContent = `
      <div class="p-2 min-w-[200px]">
        ${title ? `<h3 class="font-semibold text-sm mb-1">${title}</h3>` : ''}
        ${price ? `<p class="text-primary font-bold text-sm mb-1">${price}</p>` : ''}
        ${address ? `<p class="text-xs text-muted-foreground">${address}</p>` : ''}
      </div>
    `

    // Add marker with popup
    const marker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(popupContent)
      .openPopup()

    mapInstanceRef.current = map

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, title, address, price])

  return (
    <div 
      ref={mapRef} 
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    />
  )
}

export default PropertyMap