
import React from "react";
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from "react-oidc-context";
import { UserManager } from "oidc-client-ts";

export const userManager = new UserManager({
    authority: "https://auth.schematicstory.com",
    client_id: "2nq61758ro0hf07ur5hfik0o24",
    redirect_uri: import.meta.env.VITE_APP_REDIR,
    response_type: "code",
    scope: "phone openid email",
    metadata: {
      issuer: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_b8W4pWgKr",
      authorization_endpoint: "https://auth.schematicstory.com/oauth2/authorize",
      token_endpoint:         "https://auth.schematicstory.com/oauth2/token",
      userinfo_endpoint:      "https://auth.schematicstory.com/oauth2/userInfo",
      revocation_endpoint:    "https://auth.schematicstory.com/oauth2/revoke",
      jwks_uri:               "https://auth.schematicstory.com/.well-known/jwks.json",
      end_session_endpoint:   "https://auth.schematicstory.com/logout"
    }
});

// Store root on `window` during dev to avoid re-creating on HMR
const root = (window as any).__root ?? ReactDOM.createRoot(document.getElementById("root")!);

if (import.meta.hot) {
  (window as any).__root = root; // preserve for HMR
}

const onSigninCallback = (_user: any) => {
    window.history.replaceState({}, document.title, window.location.pathname);
}

root.render(
    <React.StrictMode>
        <AuthProvider userManager={userManager} onSigninCallback={onSigninCallback}>
            <App />
        </AuthProvider>
    </React.StrictMode>
);