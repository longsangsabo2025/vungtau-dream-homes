import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { MapPin, Search, Locate } from 'lucide-react'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapPickerProps {
  latitude?: number
  longitude?: number
  onLocationChange: (lat: number, lng: number, address?: string) => void
  height?: string
  className?: string
}

// Vũng Tàu default center
const VUNGTAU_CENTER = { lat: 10.3460, lng: 107.0843 }

const MapPicker = ({ 
  latitude, 
  longitude, 
  onLocationChange,
  height = '300px',
  className = ''
}: MapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [currentAddress, setCurrentAddress] = useState('')

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initialLat = latitude || VUNGTAU_CENTER.lat
    const initialLng = longitude || VUNGTAU_CENTER.lng

    // Create map
    const map = L.map(mapRef.current).setView([initialLat, initialLng], 15)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    // Create draggable marker
    const marker = L.marker([initialLat, initialLng], {
      draggable: true
    }).addTo(map)

    // Handle marker drag
    marker.on('dragend', async () => {
      const pos = marker.getLatLng()
      const address = await reverseGeocode(pos.lat, pos.lng)
      setCurrentAddress(address)
      onLocationChange(pos.lat, pos.lng, address)
    })

    // Handle map click to move marker
    map.on('click', async (e) => {
      marker.setLatLng(e.latlng)
      const address = await reverseGeocode(e.latlng.lat, e.latlng.lng)
      setCurrentAddress(address)
      onLocationChange(e.latlng.lat, e.latlng.lng, address)
    })

    mapInstanceRef.current = map
    markerRef.current = marker

    // Get initial address
    if (latitude && longitude) {
      reverseGeocode(latitude, longitude).then(setCurrentAddress)
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update marker when props change
  useEffect(() => {
    if (markerRef.current && latitude && longitude) {
      markerRef.current.setLatLng([latitude, longitude])
      mapInstanceRef.current?.setView([latitude, longitude], 15)
    }
  }, [latitude, longitude])

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
      )
      const data = await response.json()
      return data.display_name || ''
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return ''
    }
  }

  // Search for location by address
  const searchLocation = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      // Add "Vũng Tàu" to query for better results
      const query = searchQuery.toLowerCase().includes('vũng tàu') 
        ? searchQuery 
        : `${searchQuery}, Vũng Tàu, Vietnam`
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=vi`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)

        // Move map and marker
        mapInstanceRef.current?.setView([lat, lng], 16)
        markerRef.current?.setLatLng([lat, lng])
        
        setCurrentAddress(result.display_name)
        onLocationChange(lat, lng, result.display_name)
      } else {
        alert('Không tìm thấy địa chỉ. Vui lòng thử lại với từ khóa khác.')
      }
    } catch (error) {
      console.error('Search error:', error)
      alert('Lỗi tìm kiếm. Vui lòng thử lại.')
    } finally {
      setSearching(false)
    }
  }

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        mapInstanceRef.current?.setView([lat, lng], 16)
        markerRef.current?.setLatLng([lat, lng])

        const address = await reverseGeocode(lat, lng)
        setCurrentAddress(address)
        onLocationChange(lat, lng, address)
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Không thể lấy vị trí hiện tại. Vui lòng cho phép truy cập vị trí.')
      }
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Tìm địa chỉ (VD: 601A Nguyễn An Ninh)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button 
          type="button" 
          variant="outline" 
          onClick={searchLocation}
          disabled={searching}
        >
          {searching ? 'Đang tìm...' : 'Tìm'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={getCurrentLocation}
          title="Vị trí hiện tại"
        >
          <Locate className="h-4 w-4" />
        </Button>
      </div>

      {/* Map */}
      <div 
        ref={mapRef} 
        className="rounded-lg overflow-hidden border"
        style={{ height }}
      />

      {/* Instructions & Current address */}
      <div className="text-sm text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Click vào bản đồ hoặc kéo thả ghim để chọn vị trí chính xác</span>
        </div>
        {currentAddress && (
          <div className="p-2 bg-muted rounded text-xs">
            <strong>Địa chỉ đã chọn:</strong> {currentAddress}
          </div>
        )}
      </div>
    </div>
  )
}

export default MapPicker
