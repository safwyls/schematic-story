import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { router } from './Router';
import { mantineTheme } from './theme';
import { RouterProvider } from 'react-router-dom';
import "./styles/App.css";
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "react-oidc-context";
import { UserManager } from 'oidc-client-ts';

// Create a client
const queryClient = new QueryClient();

// This code is only for TypeScript
declare global {
    interface Window {
      __TANSTACK_QUERY_CLIENT__:
        import("@tanstack/query-core").QueryClient;
    }
}

// This code is for all users
window.__TANSTACK_QUERY_CLIENT__ = queryClient;

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

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider userManager={userManager}>
                <MantineProvider theme={mantineTheme}>
                    <Notifications />  
                    <RouterProvider router={router}/>
                </MantineProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
