import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from './ui/button'
import { MapPin, List, X } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Property {
  id: string
  title: string
  price: number
  location: string
  latitude?: number
  longitude?: number
  image_url?: string
  type: string
  bedrooms?: number
  bathrooms?: number
  area?: number
}

interface PropertiesMapViewProps {
  properties: Property[]
  onPropertySelect?: (property: Property) => void
  className?: string
  height?: string
}

const PropertiesMapView = ({ 
  properties, 
  onPropertySelect,
  className = '',
  height = '600px' 
}: PropertiesMapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showList, setShowList] = useState(false)

  // Default center (Vung Tau)
  const defaultCenter: [number, number] = [10.3460, 107.0843]

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Create map
    const map = L.map(mapRef.current).setView(defaultCenter, 12)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker)
    })
    markersRef.current = []

    // Add new markers
    const validProperties = properties.filter(p => p.latitude && p.longitude)
    
    if (validProperties.length === 0) return

    validProperties.forEach(property => {
      if (!property.latitude || !property.longitude) return

      const popupContent = `
        <div class="p-3 min-w-[250px]">
          <h3 class="font-semibold text-sm mb-2">${property.title}</h3>
          <p class="text-primary font-bold text-lg mb-2">${property.price.toLocaleString('vi-VN')} VND</p>
          <p class="text-xs text-muted-foreground mb-2">${property.location}</p>
          <div class="flex gap-2 text-xs text-muted-foreground mb-2">
            ${property.bedrooms ? `<span>${property.bedrooms} PN</span>` : ''}
            ${property.bathrooms ? `<span>${property.bathrooms} WC</span>` : ''}
            ${property.area ? `<span>${property.area} m²</span>` : ''}
          </div>
          <button 
            onclick="window.selectProperty('${property.id}')"
            class="w-full bg-primary text-white px-3 py-1 rounded text-xs hover:bg-primary/90"
          >
            Xem chi tiết
          </button>
        </div>
      `

      const marker = L.marker([property.latitude, property.longitude])
        .addTo(mapInstanceRef.current!)
        .bindPopup(popupContent)

      marker.on('click', () => {
        setSelectedProperty(property)
      })

      markersRef.current.push(marker)
    })

    // Fit map to markers
    if (validProperties.length > 1) {
      const group = new L.featureGroup(markersRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    } else if (validProperties.length === 1) {
      mapInstanceRef.current.setView(
        [validProperties[0].latitude!, validProperties[0].longitude!], 
        15
      )
    }
  }, [properties])

  // Global function for popup buttons
  useEffect(() => {
    (window as any).selectProperty = (propertyId: string) => {
      const property = properties.find(p => p.id === propertyId)
      if (property && onPropertySelect) {
        onPropertySelect(property)
      }
    }

    return () => {
      delete (window as any).selectProperty
    }
  }, [properties, onPropertySelect])

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`
    }
    return price.toLocaleString('vi-VN')
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map */}
      <div 
        ref={mapRef} 
        className="w-full rounded-lg overflow-hidden"
        style={{ height }}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowList(!showList)}
          className="shadow-lg"
        >
          {showList ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
        </Button>
      </div>

      {/* Property List Overlay */}
      {showList && (
        <div className="absolute top-4 left-4 w-80 max-h-96 overflow-y-auto bg-background rounded-lg shadow-lg border">
          <div className="p-3 border-b">
            <h3 className="font-semibold text-sm">Properties ({properties.length})</h3>
          </div>
          <div className="p-2">
            {properties.map(property => (
              <Card 
                key={property.id} 
                className="mb-2 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => {
                  if (property.latitude && property.longitude && mapInstanceRef.current) {
                    mapInstanceRef.current.setView([property.latitude, property.longitude], 16)
                    setSelectedProperty(property)
                  }
                  if (onPropertySelect) {
                    onPropertySelect(property)
                  }
                }}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm line-clamp-1">{property.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {property.type}
                    </Badge>
                  </div>
                  <p className="text-primary font-bold text-sm mb-1">
                    {formatPrice(property.price)} VND
                  </p>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {property.location}
                  </p>
                  {(property.bedrooms || property.bathrooms || property.area) && (
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {property.bedrooms && <span>{property.bedrooms} PN</span>}
                      {property.bathrooms && <span>{property.bathrooms} WC</span>}
                      {property.area && <span>{property.area} m²</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertiesMapView