import { BedDouble, Bath, Maximize2, MapPin, Heart, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useFavorite } from "@/hooks/useFavorite";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: string;
  image_url: string;
  type: string;
  status?: string;
  isHot?: boolean;
  className?: string;
}

const PropertyCard = ({
  id,
  title,
  price,
  area,
  bedrooms,
  bathrooms,
  location,
  image_url,
  type,
  status,
  isHot,
  className,
}: PropertyCardProps) => {
  const navigate = useNavigate();
  const { isFavorite, loading: favoriteLoading, toggleFavorite } = useFavorite({ propertyId: id });
  
  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return price.toLocaleString("vi-VN");
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card border hover-lift cursor-pointer",
        className
      )}
      onClick={() => navigate(`/property/${id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/property/${id}`);
        }
      }}
      role="button"
      tabIndex={0}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
        <img
          src={image_url}
          alt={title}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-secondary text-secondary-foreground font-medium">
            {type}
          </Badge>
          {status && (
            <Badge className="bg-primary text-primary-foreground font-medium">
              {status}
            </Badge>
          )}
          {isHot && (
            <Badge className="bg-accent text-accent-foreground font-medium">
              HOT
            </Badge>
          )}
        </div>

        {/* Favorite button */}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "absolute top-3 right-3 h-9 w-9 backdrop-blur-sm transition-all",
            isFavorite 
              ? "bg-destructive/90 text-white hover:bg-destructive" 
              : "bg-background/80 hover:bg-background/90 hover:text-destructive"
          )}
          onClick={toggleFavorite}
          disabled={favoriteLoading}
        >
          {favoriteLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart 
              className={cn("h-4 w-4", isFavorite && "fill-current")} 
              strokeWidth={2.5} 
            />
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="mb-2">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(price)} VNĐ
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-base font-semibold text-foreground line-clamp-2 min-h-[3rem]">
          {title}
        </h3>

        {/* Location */}
        <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" strokeWidth={2.5} />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 border-t pt-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Maximize2 className="h-4 w-4" strokeWidth={2.5} />
            <span className="font-medium">{area}m²</span>
          </div>
          {Boolean(bedrooms && bedrooms > 0) && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <BedDouble className="h-4 w-4" strokeWidth={2.5} />
              <span className="font-medium">{bedrooms} PN</span>
            </div>
          )}
          {Boolean(bathrooms && bathrooms > 0) && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Bath className="h-4 w-4" strokeWidth={2.5} />
              <span className="font-medium">{bathrooms} WC</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
