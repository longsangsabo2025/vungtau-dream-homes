import { useState } from 'react'
import { useProperties } from '../hooks/useSupabase'
import PropertyCard from './PropertyCard'
import AddPropertyDialog from './AddPropertyDialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const PropertyList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 12

  const { properties, loading, error, totalCount, totalPages } = useProperties({
    page,
    pageSize,
    searchQuery,
    typeFilter,
    statusFilter
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => Math.random().toString(36).substring(2)).map((key) => (
            <div key={key} className="space-y-4">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Lỗi khi tải dữ liệu: {error}
        </AlertDescription>
      </Alert>
    )
  }

  const propertyTypes = ['Villa', 'Căn hộ', 'Nhà phố', 'Đất nền', 'Biệt thự', 'Shophouse', 'Studio', 'Condotel', 'Đất thổ cư']
  const statusOptions = ['Có sẵn', 'Hot', 'Nổi bật', 'Đã bán']

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc địa điểm..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1) // Reset to first page on search
            }}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={typeFilter || 'all'} onValueChange={(value) => {
            setTypeFilter(value === 'all' ? '' : value)
            setPage(1)
          }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Loại BDS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {propertyTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter || 'all'} onValueChange={(value) => {
            setStatusFilter(value === 'all' ? '' : value)
            setPage(1)
          }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <AddPropertyDialog />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="text-sm">
          Tổng cộng: {totalCount} bất động sản
        </Badge>
        <Badge variant="outline" className="text-sm">
          Trang {page} / {totalPages || 1}
        </Badge>
      </div>

      {/* Properties grid */}
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {totalCount === 0 
              ? "Chưa có bất động sản nào được thêm" 
              : "Không tìm thấy bất động sản phù hợp"
            }
          </div>
          <Button variant="outline" onClick={() => {
            setSearchQuery('')
            setTypeFilter('')
            setStatusFilter('')
            setPage(1)
          }}>
            Xóa bộ lọc
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                price={property.price}
                area={property.area}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                location={property.location}
                image_url={property.image_url}
                type={property.type}
                status={property.status}
                isHot={property.status === 'Hot' || property.status === 'Nổi bật'}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trang trước
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PropertyList