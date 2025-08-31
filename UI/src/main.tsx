
import React from "react";
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from "react-oidc-context";
import { useAuthStore } from "./store/AuthStore";

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
        <AuthProvider userManager={useAuthStore.getState().userManager} onSigninCallback={onSigninCallback}>
            <App />
        </AuthProvider>
    </React.StrictMode>
);