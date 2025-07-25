export interface Comment {
  commentId: number
  playerId: number
  userId: number
  username: string
  content: string
  createdAt: string
  deleted: boolean
  updatedAt?: string
}

export interface CreateCommentRequest {
  content: string
}

export interface CommentListResponse {
  comments: Comment[]
  pagination: PaginationInfo
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalElements: number
  size: number
  hasNext: boolean
  hasPrevious: boolean
  first: boolean
  last: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  timestamp: string
}

export interface DeleteCommentResponse {
  deletedCommentId: number
} 