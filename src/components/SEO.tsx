import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
  structuredData?: any
  price?: number
  propertyType?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  location?: string
  noIndex?: boolean
  canonical?: string
}

export function SEO({
  title = 'VungTauLand - Bất động sản Vũng Tàu #1',
  description = 'Nền tảng bất động sản uy tín tại Vũng Tàu. Mua bán nhà đất, villa, căn hộ, đất nền với giá tốt nhất. Kết nối hàng nghìn môi giới chuyên nghiệp.',
  keywords = 'bất động sản vũng tàu, nhà đất vũng tàu, mua bán nhà đất, cho thuê nhà, chung cư vũng tàu, villa vũng tàu, đất nền vũng tàu, môi giới bất động sản',
  image = '/og-image.jpg',
  url,
  type = 'website',
  structuredData,
  price,
  propertyType,
  bedrooms,
  bathrooms,
  area,
  location,
  noIndex = false,
  canonical,
}: SEOProps) {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://vungtauland.com');
  const canonicalUrl = canonical || currentUrl;

  // Generate property-specific structured data
  const propertySchema = price && propertyType ? {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": title,
    "description": description,
    "url": currentUrl,
    "image": image,
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "VND",
      "availability": "https://schema.org/InStock"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location || "Vũng Tàu",
      "addressRegion": "Bà Rịa - Vũng Tàu",
      "addressCountry": "VN"
    },
    "floorSize": area ? {
      "@type": "QuantitativeValue",
      "value": area,
      "unitCode": "MTK"
    } : undefined,
    "numberOfRooms": bedrooms,
    "numberOfBathroomsTotal": bathrooms,
    "category": propertyType
  } : null;

  // Default organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "VungTauLand",
    "description": "Nền tảng bất động sản uy tín tại Vũng Tàu",
    "url": "https://vungtauland.com",
    "logo": "https://vungtauland.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Vũng Tàu",
      "addressRegion": "Bà Rịa - Vũng Tàu",
      "addressCountry": "VN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "areaServed": "VN",
      "availableLanguage": "Vietnamese"
    },
    "sameAs": [
      "https://www.facebook.com/vungtauland",
      "https://www.youtube.com/vungtauland"
    ]
  };

  const finalStructuredData = structuredData || propertySchema || organizationSchema;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image.startsWith('http') ? image : `https://vungtauland.com${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="vi_VN" />
      <meta property="og:site_name" content="VungTauLand" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@vungtauland" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `https://vungtauland.com${image}`} />
      
      {/* Additional SEO */}
      <meta name="language" content="vi" />
      <meta name="author" content="VungTauLand" />
      <meta name="copyright" content="VungTauLand" />
      <meta name="geo.region" content="VN-BR" />
      <meta name="geo.placename" content="Vũng Tàu" />
      <meta name="geo.position" content="10.4113;107.1365" />
      <meta name="ICBM" content="10.4113, 107.1365" />
      
      {/* Mobile & Viewport */}
      <meta name="theme-color" content="#1e40af" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="VungTauLand" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Structured Data */}
      {finalStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(finalStructuredData)}
        </script>
      )}
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
    </Helmet>
  )
}