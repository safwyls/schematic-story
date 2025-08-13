
import React from "react";
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_R5wGuJNNa",
  client_id: "5pk6av8r8nctg7cphchlt7pe2s",
  redirect_uri: "https://schematicstory.com",
  response_type: "code",
  scope: "phone openid email",
};

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);