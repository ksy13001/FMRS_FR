export interface User {
  id: number
  username: string
}

export interface LoginResponse {
  success: boolean
  message: string
  user?: User
}

export interface SignupResponse {
  success: boolean
  message: string
  user?: User
}

export interface AuthStatusResponse {
  success: boolean
  message: string
  user?: User
}

export interface RefreshResponse {
  success: boolean
  message: string
}
