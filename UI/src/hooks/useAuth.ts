// hooks/useAuth.js
import { useAuth as useOidc } from 'react-oidc-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import apiClient from '../api/client'

const authKeys = {
  user: ['auth', 'user'],
  avatar: ['auth', 'avatar'],
}

export const useAuth = () => {
  const oidc = useOidc()
  const queryClient = useQueryClient()

  // Set up token getter for axios interceptor
  useEffect(() => {
    if (oidc.user?.id_token) {
      apiClient.setTokenGetter(() => Promise.resolve(oidc.user?.id_token ?? null))
    }
  }, [oidc.user?.id_token])

  const userAvatarQuery = useQuery({
    queryKey: authKeys.avatar,
    queryFn: async () => {
      const userId = oidc.user?.profile?.sub;
      console.log(oidc.user);
      if (userId) {
        const data = await apiClient.get(`/users/${userId}/avatar`);
        return data;
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
    await signoutRedirect()
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

  const signoutRedirect = async () => {    
    // Remove the user from local session
    await oidc.removeUser();
    const clientId = import.meta.env.VITE_APP_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_APP_REDIR;
    const cognitoDomain = import.meta.env.VITE_APP_AUTH_DOMAIN;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  return {
    // OIDC state
    user: oidc.user,
    userId: oidc.user?.profile?.sub,
    userProfile: oidc.user?.profile,
    isLoading: oidc.isLoading,
    isAuthenticated: oidc.isAuthenticated,
    error: oidc.error,

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
    loading: oidc.isLoading || userAvatarQuery.isLoading,
  }
}