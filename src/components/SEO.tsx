import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
}

export function SEO({
  title = 'VungTauLand - Bất động sản Vũng Tàu',
  description = 'Tìm kiếm và mua bán bất động sản tại Vũng Tàu. Villa, căn hộ, nhà phố, đất nền chất lượng với giá tốt nhất.',
  keywords = 'bất động sản, Vũng Tàu, mua nhà, bán nhà, villa, căn hộ, đất nền',
  image = '/og-image.jpg',
  url = 'https://vungtauland.com',
  type = 'website',
}: SEOProps) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Vietnamese" />
      <meta name="author" content="VungTauLand" />
      <link rel="canonical" href={url} />
    </Helmet>
  )
}