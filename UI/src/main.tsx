
import React from "react";
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from "react-oidc-context";

// const cognitoAuthConfig = {
//   authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_b8W4pWgKr",
//   client_id: "2nq61758ro0hf07ur5hfik0o24",
//   redirect_uri: "https://schematicstory.com",
//   response_type: "code",
//   scope: "phone openid email",
// };

const cognitoAuthConfig = {
  authority: "https://auth.schematicstory.com",
  client_id: "2nq61758ro0hf07ur5hfik0o24",
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