
import React from "react";
import ReactDOM from 'react-dom/client';
import App from './App';

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
        <App />
    </React.StrictMode>
);