"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, User } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import type { Comment } from "@/types/comment-types"

interface CommentItemProps {
  comment: Comment
  onDelete: (commentId: number) => Promise<void>
  isDeleting?: boolean
}

export default function CommentItem({ comment, onDelete, isDeleting = false }: CommentItemProps) {
  const { user } = useAuth()
  const [isDeletingLocal, setIsDeletingLocal] = useState(false)
  const isOwner = user?.id === comment.userId

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    console.log("🔍 handleDelete called with comment:", comment)
    console.log("🔍 comment.commentId:", comment.commentId, "type:", typeof comment.commentId)

    setIsDeletingLocal(true)
    try {
      await onDelete(comment.commentId)
    } catch (error) {
      console.error("댓글 삭제 실패:", error)
    } finally {
      setIsDeletingLocal(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-2 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <div className="font-medium text-slate-800 text-sm">
              {comment.username}
            </div>
            <div className="text-xs text-slate-500">
              {formatDate(comment.createdAt)}
            </div>
          </div>
        </div>
        
        {isOwner && !comment.deleted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeletingLocal || isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
          >
            {isDeletingLocal ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
      
      <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
        {comment.deleted ? (
          <div className="text-slate-400 italic">
            This comment has been deleted.
          </div>
        ) : (
          comment.content
        )}
      </div>
    </div>
  )
} 