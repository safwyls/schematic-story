// hooks/useAuth.js
import { useAuth as useOidc } from 'react-oidc-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import apiClient from '../api/client'

const authKeys = {
  user: ['auth', 'user'],
  profile: ['auth', 'profile'],
  avatar: ['auth', 'avatar'],
}

export const useAuth = () => {
  const oidc = useOidc()
  const queryClient = useQueryClient()

  // Set up token getter for axios interceptor
  useEffect(() => {
    if (oidc.user?.access_token) {
      apiClient.setTokenGetter(() => Promise.resolve(oidc.user?.access_token ?? null))
    }
  }, [oidc.user?.access_token])

  // Fetch additional user data from dynamodb via api gateway
  const userProfileQuery = useQuery({
    queryKey: authKeys.profile,
    queryFn: async () => {
      const userId = oidc.user?.profile?.sub;
      if (userId) {
        const response = await apiClient.get(`/users/${userId}/profile`)
        return response.data
      }
    },
    enabled: !!oidc.user && !oidc.isLoading,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const userAvatarQuery = useQuery({
    queryKey: authKeys.avatar,
    queryFn: async () => {
      const userId = oidc.user?.profile?.sub;
      if (userId) {
        const response = await apiClient.get(`/users/${userId}/avatar`)
        return response.data
      }
    },
    enabled: !!oidc.user && !oidc.isLoading,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Clear queries when user logs out
  useEffect(() => {
    if (!oidc.user && !oidc.isLoading) {
      queryClient.clear()
    }
  }, [oidc.user, oidc.isLoading, queryClient])

  // Combined login function
  const login = async (additionalParams = {}) => {
    await oidc.signinRedirect(additionalParams)
  }

  // Enhanced logout that clears TanStack Query cache
  const logout = async () => {
    queryClient.clear()
    await oidc.signoutRedirect()
  }

  // Silent token refresh
  const refreshToken = async () => {
    try {
      await oidc.signinSilent()
    } catch (error) {
      console.error('Silent refresh failed:', error)
      // Optionally redirect to login
    }
  }

  return {
    // OIDC state
    user: oidc.user,
    isLoading: oidc.isLoading,
    isAuthenticated: oidc.isAuthenticated,
    error: oidc.error,
    
    // Additional profile data from your API
    profile: userProfileQuery.data,
    profileLoading: userProfileQuery.isLoading,
    profileError: userProfileQuery.error,

    avatar: userAvatarQuery.data,
    avatarLoading: userAvatarQuery.isLoading,
    avatarError: userAvatarQuery.error,
    
    // Auth actions
    login,
    logout,
    refreshToken,
    
    // OIDC methods you might need
    signinSilent: oidc.signinSilent,
    removeUser: oidc.removeUser,
    
    // Token access
    accessToken: oidc.user?.access_token,
    idToken: oidc.user?.id_token,
    
    // Combined loading state
    loading: oidc.isLoading || userProfileQuery.isLoading || userAvatarQuery.isLoading,
  }
}