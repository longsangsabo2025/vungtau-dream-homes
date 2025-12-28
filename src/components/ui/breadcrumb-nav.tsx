import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

// Route to Vietnamese label mapping
const routeLabels: Record<string, string> = {
  '': 'Trang chủ',
  'mua-ban': 'Mua bán',
  'cho-thue': 'Cho thuê',
  'tin-tuc': 'Tin tức',
  'dang-tin': 'Đăng tin',
  'property': 'Chi tiết BĐS',
  'properties': 'Bất động sản',
  'dashboard': 'Dashboard',
  'my-properties': 'Tin đăng của tôi',
  'favorites': 'Yêu thích',
  'profile': 'Hồ sơ',
  'settings': 'Cài đặt',
  'admin': 'Quản trị',
  'new': 'Tạo mới',
  'edit': 'Chỉnh sửa',
}

/**
 * Auto-generate breadcrumbs from current path or use custom items
 */
export function Breadcrumb({ items, className, showHome = true }: BreadcrumbProps) {
  const location = useLocation()

  // Auto-generate breadcrumbs from path if no items provided
  const breadcrumbItems: BreadcrumbItem[] = items || generateBreadcrumbs(location.pathname)

  // Prepend home if showHome is true and not already included
  const finalItems = showHome && breadcrumbItems[0]?.href !== '/' 
    ? [{ label: 'Trang chủ', href: '/' }, ...breadcrumbItems]
    : breadcrumbItems

  if (finalItems.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-4', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {finalItems.map((item, index) => {
          const isLast = index === finalItems.length - 1

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              
              {item.href && !isLast ? (
                <Link 
                  to={item.href}
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  {index === 0 && showHome && (
                    <Home className="h-3.5 w-3.5" />
                  )}
                  <span className="max-w-[150px] truncate sm:max-w-none">
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span 
                  className={cn(
                    'max-w-[200px] truncate sm:max-w-none',
                    isLast && 'text-foreground font-medium'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length === 0) return []

  const breadcrumbs: BreadcrumbItem[] = []
  let currentPath = ''

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    // Skip UUID/ID segments but still build path
    const isId = segment.length > 20 || /^[0-9a-f-]{36}$/i.test(segment)
    
    if (!isId) {
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      
      breadcrumbs.push({
        label,
        href: i < segments.length - 1 ? currentPath : undefined
      })
    }
  }

  return breadcrumbs
}

/**
 * Property detail breadcrumb helper
 */
export function PropertyBreadcrumb({ 
  propertyTitle,
  propertyType,
  className 
}: { 
  propertyTitle: string
  propertyType?: string
  className?: string 
}) {
  const items: BreadcrumbItem[] = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Mua bán', href: '/mua-ban' },
  ]

  if (propertyType) {
    items.push({ label: propertyType, href: `/mua-ban?type=${encodeURIComponent(propertyType)}` })
  }

  items.push({ label: propertyTitle })

  return <Breadcrumb items={items} showHome={false} className={className} />
}

export default Breadcrumb
