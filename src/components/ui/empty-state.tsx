import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Search, 
  FileText, 
  Users, 
  Heart, 
  MessageSquare,
  Package,
  AlertCircle,
  type LucideIcon 
} from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "default" | "compact" | "card";
}

const defaultIcons: Record<string, LucideIcon> = {
  properties: Home,
  search: Search,
  documents: FileText,
  users: Users,
  favorites: Heart,
  messages: MessageSquare,
  default: Package,
};

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  if (variant === "compact") {
    return (
      <div className={cn("text-center py-8", className)}>
        <Icon className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">{title}</p>
        {action && (
          <Button 
            variant="link" 
            size="sm" 
            onClick={action.onClick}
            className="mt-2"
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed bg-muted/30",
        className
      )}>
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
            {description}
          </p>
        )}
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4",
      className
    )}>
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <Icon className="h-12 w-12 text-primary" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <Button size="lg" onClick={action.onClick} className="gap-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Preset empty states
export function NoPropertiesFound({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon={Home}
      title="Không tìm thấy bất động sản"
      description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả"
      action={onReset ? { label: "Xóa bộ lọc", onClick: onReset } : undefined}
    />
  );
}

export function NoFavorites({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={Heart}
      title="Chưa có mục yêu thích"
      description="Lưu những bất động sản bạn quan tâm để xem lại sau"
      action={onBrowse ? { label: "Khám phá BĐS", onClick: onBrowse } : undefined}
    />
  );
}

export function NoMessages() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Chưa có tin nhắn"
      description="Các cuộc trò chuyện của bạn sẽ xuất hiện ở đây"
      variant="compact"
    />
  );
}

export function NoResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={Search}
      title={query ? `Không tìm thấy "${query}"` : "Không có kết quả"}
      description="Vui lòng thử từ khóa khác hoặc điều chỉnh bộ lọc"
    />
  );
}
