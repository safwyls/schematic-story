import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {} from '@redux-devtools/extension'; // required for devtools typing
import { ShortUser } from '@/types/common';
import { User, UserManager } from 'oidc-client-ts';
import { userManager } from '@/main';

interface AuthState {
  user: ShortUser,
  authenticated: boolean,
  signOut: () => void;
  getAccessToken: () => Promise<string | null>;
  setFromOidcUser: (u: User | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: {
          id: '', 
          username: '',
          preferred_username: '',
          email: '', 
          avatarUrl: '', 
          timezone: ''
        },
        authenticated: false,
        signOut: () => {

        },
        getAccessToken: () => {
          return new Promise((resolve, reject) => {            
            userManager.getUser().then((user) => {
              if (user) {
                // Try id_token first (common for AWS Cognito), fallback to access_token
                const token = user.id_token || user.access_token;
                console.log('Available tokens:', {
                  hasIdToken: !!user.id_token,
                  hasAccessToken: !!user.access_token,
                  usingToken: token ? 'id_token' : 'access_token'
                });
                resolve(token);
              } else {
                reject(new Error('No access token available'));
              }
            });
          });
        },
        setFromOidcUser: (u) => 
          set(() => {
            if (!u || !u.profile) return { user: undefined, authenticated: false };
            // Map claims
            const appUser: ShortUser = {
              id: (u.profile.sub as string) ?? '',
              username: (u.profile["cognito:username"] as string) ?? (u.profile.email as string) ?? '',
              preferred_username: (u.profile["preferred_username"] as string) ?? '',
              avatarUrl: '',
              email: (u.profile.email as string) ?? '',
              timezone: (u.profile["timezone"] as string) ?? 'America/Los_Angeles'
            };
            return { user: appUser, authenticated: true };
          }),
          clear: () => set({ user: undefined, authenticated: false}),
        
      }),
      {
        name: 'auth-storage',
      }
    ),
  ),
) 