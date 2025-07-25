"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { PaginationInfo } from "@/types/comment-types"

interface CommentPaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export default function CommentPagination({ 
  pagination, 
  onPageChange, 
  isLoading = false 
}: CommentPaginationProps) {
  const { currentPage, totalPages, hasNext, hasPrevious } = pagination

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()
  const startPage = pageNumbers[0] || 0
  const endPage = pageNumbers[pageNumbers.length - 1] || 0

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious || isLoading}
        className="px-2 py-1"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {startPage > 0 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(0)}
            disabled={isLoading}
            className="px-2 py-1"
          >
            1
          </Button>
          {startPage > 1 && (
            <span className="px-2 text-slate-500">...</span>
          )}
        </>
      )}

      {pageNumbers.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          className="px-2 py-1"
        >
          {page + 1}
        </Button>
      ))}

      {endPage < totalPages - 1 && (
        <>
          {endPage < totalPages - 2 && (
            <span className="px-2 text-slate-500">...</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={isLoading}
            className="px-2 py-1"
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext || isLoading}
        className="px-2 py-1"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
} 