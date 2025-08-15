import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { router } from './Router';
import { mantineTheme } from './theme';
import { RouterProvider } from 'react-router-dom';
import "./App.css";
import { AuthProvider } from 'react-oidc-context';
import { useAuthStore } from "@/store/AuthStore";

export default function App() {
  const cognitoAuthConfig = {
    authority: "https://auth.schematicstory.com",
    client_id: "2nq61758ro0hf07ur5hfik0o24",
    redirect_uri: import.meta.env.VITE_APP_REDIR,
    response_type: "code",
    scope: "phone openid email",
    onSigninCallback: (_user: any) => {
      window.history.replaceState({}, document.title, window.location.pathname);
    },
    metadata: {
      issuer: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_b8W4pWgKr",
      authorization_endpoint: "https://auth.schematicstory.com/oauth2/authorize",
      token_endpoint:         "https://auth.schematicstory.com/oauth2/token",
      userinfo_endpoint:      "https://auth.schematicstory.com/oauth2/userInfo",
      revocation_endpoint:    "https://auth.schematicstory.com/oauth2/revoke",
      jwks_uri:               "https://auth.schematicstory.com/.well-known/jwks.json",
      end_session_endpoint:   "https://auth.schematicstory.com/logout"
    }
  };

  return (
      <AuthProvider {...cognitoAuthConfig}>
        <MantineProvider theme={mantineTheme}>
          <RouterProvider router={router}/>
        </MantineProvider>
      </AuthProvider>
    );
}
