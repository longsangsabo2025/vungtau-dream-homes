import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  placeholderClassName?: string
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto'
  blurHash?: string
}

/**
 * Progressive Image Component
 * - Lazy loads images when they enter viewport
 * - Shows blur placeholder while loading
 * - Smooth fade-in transition when loaded
 */
export function ProgressiveImage({
  src,
  alt,
  className,
  placeholderClassName,
  aspectRatio = 'video',
  blurHash
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { 
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.1 
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [])

  const aspectRatioClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    auto: ''
  }

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  return (
    <div 
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {/* Placeholder/Blur background */}
      <div 
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10',
          'transition-opacity duration-500',
          isLoaded ? 'opacity-0' : 'opacity-100',
          placeholderClassName
        )}
      >
        {/* Shimmer effect while loading */}
        {!isLoaded && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
      </div>

      {/* Actual image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover',
            'transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <svg 
              className="w-8 h-8 mx-auto mb-2 opacity-50" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span className="text-xs">Không tải được ảnh</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Image Gallery with lazy loading
 */
interface ImageGalleryProps {
  images: string[]
  alt: string
  className?: string
}

export function LazyImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className={cn('aspect-video bg-muted rounded-lg flex items-center justify-center', className)}>
        <span className="text-muted-foreground">Chưa có ảnh</span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Main image */}
      <ProgressiveImage
        src={images[selectedIndex]}
        alt={`${alt} - Ảnh ${selectedIndex + 1}`}
        className="rounded-lg"
        aspectRatio="video"
      />

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all',
                selectedIndex === index 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-transparent hover:border-muted-foreground/30'
              )}
            >
              <ProgressiveImage
                src={image}
                alt={`${alt} - Thumbnail ${index + 1}`}
                className="w-full h-full"
                aspectRatio="square"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProgressiveImage
