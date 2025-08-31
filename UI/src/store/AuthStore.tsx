import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {} from '@redux-devtools/extension'; // required for devtools typing
import { ShortUser } from '@/types/common';
import { User, UserManager } from 'oidc-client-ts';

interface AuthState {
  user: ShortUser,
  authenticated: boolean,
  userManager: UserManager;
  signOut: () => void;
  getAccessToken: () => Promise<string | null>;
  setFromOidcUser: (u: User | null) => void;
  clear: () => void;
}

const userManager = new UserManager({
    authority: import.meta.env.VITE_APP_AUTH_ISSUER,
    client_id: import.meta.env.VITE_APP_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_APP_REDIR,
    response_type: "code",
    scope: "profile openid email",
    metadata: {
      issuer: import.meta.env.VITE_APP_AUTH_ISSUER,
      authorization_endpoint: `${import.meta.env.VITE_APP_AUTH_DOMAIN}/oauth2/authorize`,
      token_endpoint:         `${import.meta.env.VITE_APP_AUTH_DOMAIN}/oauth2/token`,
      userinfo_endpoint:      `${import.meta.env.VITE_APP_AUTH_DOMAIN}/oauth2/userInfo`,
      revocation_endpoint:    `${import.meta.env.VITE_APP_AUTH_DOMAIN}/oauth2/revoke`,
      jwks_uri:               `${import.meta.env.VITE_APP_AUTH_DOMAIN}/.well-known/jwks.json`,
      end_session_endpoint:   `${import.meta.env.VITE_APP_AUTH_DOMAIN}/logout`
    }
});

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: {
          id: '',
          preferred_username: '',
          email: '', 
          avatarUrl: '', 
          timezone: ''
        },
        authenticated: false,
        userManager: userManager,
        
        signOut: () => {
        },

        getAccessToken: () => {
          return new Promise((resolve, reject) => {            
            userManager.getUser().then((user) => {
              if (user) {
                // Try id_token first (common for AWS Cognito), fallback to access_token
                const token = user.id_token || user.access_token;                
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
              preferred_username: (u.profile["preferred_username"] as string) ?? '',
              avatarUrl: (u.profile["custom:avatar_url"] as string) ?? '',
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