"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import type { CreateCommentRequest } from "@/types/comment-types"

interface CommentFormProps {
  playerId: number
  onSubmit: (comment: CreateCommentRequest) => Promise<void>
  isLoading?: boolean
}

export default function CommentForm({ playerId, onSubmit, isLoading = false }: CommentFormProps) {
  const { isAuthenticated } = useAuth()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit({ content: content.trim() })
      setContent("")
    } catch (error) {
      console.error("댓글 작성 실패:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLoginClick = () => {
    window.location.href = "/auth/login"
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-slate-500">🔒</div>
          <span className="text-sm font-medium text-slate-700">Login required to write comments</span>
        </div>
        <Button 
          onClick={handleLoginClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-2 shadow-sm">
      <div className="mb-2">
        <label htmlFor="comment-content" className="block text-sm font-medium text-slate-700 mb-1">
          Write Comment
        </label>
        <Textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment..."
          className="min-h-[80px] resize-none"
          maxLength={500}
          disabled={isSubmitting || isLoading}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-500">
            {content.length}/500 characters
          </span>
        </div>
      </div>
      <Button
        type="submit"
        disabled={!content.trim() || isSubmitting || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Posting...
          </div>
        ) : (
          "Post Comment"
        )}
      </Button>
    </form>
  )
} 