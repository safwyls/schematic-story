import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {} from '@redux-devtools/extension'; // required for devtools typing
import { AppUser } from '@/types/common';
import { User, UserManager } from 'oidc-client-ts';

interface AuthState {
  user: AppUser,
  authenticated: boolean

  setFromOidcUser: (u: User | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: { id: '', username: '', email: '', avatarUrl: '', timezone: '' },
        authenticated: false,

        setFromOidcUser: (u) => 
          set(() => {
            if (!u || !u.profile) return { user: undefined, authenticated: false };
            // Map claims
            const appUser: AppUser = {
              id: (u.profile.sub as string) ?? '',
              username: (u.profile["cognito:username"] as string) ?? (u.profile.email as string) ?? '',
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