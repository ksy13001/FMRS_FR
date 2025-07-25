"use client"

import { useState, useEffect } from "react"
import { MessageCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import CommentForm from "@/components/comment-form"
import CommentItem from "@/components/comment-item"
import CommentPagination from "@/components/comment-pagination"
import { useAuth } from "@/components/auth-provider"
import type { 
  Comment, 
  CommentListResponse, 
  CreateCommentRequest,
  ApiResponse 
} from "@/types/comment-types"

interface PlayerCommentsProps {
  playerId: number
}

export default function PlayerComments({ playerId }: PlayerCommentsProps) {
  const { isAuthenticated, user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10,
    hasNext: false,
    hasPrevious: false,
    first: true,
    last: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchComments = async (page: number = 0) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/players/${playerId}/comments?page=${page}&size=10`)
      
      if (!response.ok) {
        throw new Error("Failed to load comments.")
      }

      const data: ApiResponse<CommentListResponse> = await response.json()
      
      if (data.success) {
        console.log("🔍 Loaded comments:", data.data.comments)
        setComments(data.data.comments)
        setPagination(data.data.pagination)
      } else {
        throw new Error(data.message || "Failed to load comments.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateComment = async (commentData: CreateCommentRequest) => {
    try {
      // 인증 상태 확인
      if (!isAuthenticated) {
        throw new Error("Login required to write comments.")
      }

      console.log("Creating comment with user:", user)
      console.log("Comment data:", commentData)

      const response = await fetch(`/api/players/${playerId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(commentData),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(errorData.message || "Failed to create comment.")
      }

      const data: ApiResponse<{ comment: Comment }> = await response.json()
      
      if (data.success) {
        // 새 댓글을 첫 페이지에 추가하고 목록 새로고침
        await fetchComments(0)
      } else {
        throw new Error(data.message || "Failed to create comment.")
      }
    } catch (err) {
      console.error("Comment creation error:", err)
      throw err
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      console.log("🔍 handleDeleteComment called with:", { commentId, playerId, user })
      setIsDeleting(true)
      
      const response = await fetch(`/api/players/${playerId}/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ deleted: true }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete comment.")
      }

      const data: ApiResponse<{ comment: Comment }> = await response.json()
      
      if (data.success) {
        // 댓글 목록 새로고침 (soft delete된 댓글도 표시하기 위해)
        await fetchComments(pagination.currentPage)
      } else {
        throw new Error(data.message || "Failed to delete comment.")
      }
    } catch (err) {
      throw err
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchComments(page)
  }

  useEffect(() => {
    fetchComments()
  }, [playerId])

  if (error) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="text-blue-500" size={16} />
          <h3 className="font-semibold text-sm text-slate-800">Comments</h3>
        </div>
        
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">{error}</p>
          <Button 
            onClick={() => fetchComments()} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="text-blue-500" size={16} />
          <h3 className="font-semibold text-sm text-slate-800">
            Comments ({pagination.totalElements})
          </h3>
        </div>

        {/* 디버그 정보 (개발 환경에서만 표시) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs text-yellow-800">
              <strong>Debug Info:</strong><br/>
              Environment: {process.env.NODE_ENV}<br/>
              Backend URL: {process.env.BACKEND_URL || 'default'}<br/>
              isAuthenticated: {isAuthenticated.toString()}<br/>
              user: {user ? JSON.stringify(user) : 'null'}<br/>
              playerId: {playerId}
            </div>
          </div>
        )}

        {/* 댓글 작성 폼 */}
        <div className="mb-4">
          <CommentForm 
            playerId={playerId} 
            onSubmit={handleCreateComment}
            isLoading={isLoading}
          />
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            <>
                          {comments.map((comment) => (
              <CommentItem
                key={comment.commentId}
                comment={comment}
                onDelete={handleDeleteComment}
                isDeleting={isDeleting}
              />
            ))}
              
              {/* 페이지네이션 */}
              <CommentPagination
                pagination={pagination}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            </>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">No comments yet.</p>
              <p className="text-slate-500 text-sm">Be the first to write a comment!</p>
            </div>
          )}
        </div>
      </div>
    )
} 