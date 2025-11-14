interface PropertyStructuredDataProps {
  property: {
    id: string
    title: string
    description?: string
    price: number
    location: string
    image_url: string
    bedrooms?: number
    bathrooms?: number
    area: number
    type: string
  }
}

export function PropertyStructuredData({ property }: PropertyStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description || `${property.title} tại ${property.location}`,
    "url": `https://vungtauland.com/property/${property.id}`,
    "image": property.image_url,
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "VND"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.location,
      "addressCountry": "VN"
    },
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.area,
      "unitCode": "MTK"
    },
    "numberOfRooms": property.bedrooms,
    "numberOfBathroomsTotal": property.bathrooms,
    "additionalType": property.type
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}