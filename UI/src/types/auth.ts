export interface User {
    sub: string
    name?: string
    email?: string
    preferred_username?: string
    given_name?: string
    family_name?: string
    picture?: string
    [key: string]: any
}
  
export interface UserProfile {
    id: string
    displayName: string
    email: string
    avatar?: string
    roles: string[]
    permissions: string[]
    lastLoginAt: string
    createdAt: string
    updatedAt: string
}
  
export interface LoginCredentials {
    username: string
    password: string
}
  
export interface AuthState {
    user: User | null
    profile: UserProfile | null
    isAuthenticated: boolean
    isLoading: boolean
    error: Error | null
}