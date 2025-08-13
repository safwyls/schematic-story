import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { router } from './Router';
import { mantineTheme } from './theme';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from "react-oidc-context";
import "./App.css";

export default function App() {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = "5pk6av8r8nctg7cphchlt7pe2s";
    const logoutUri = "<logout uri>";
    const cognitoDomain = "https://<user pool domain>";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <MantineProvider theme={mantineTheme}>
        <RouterProvider router={router}/>
      </MantineProvider>
    );
  }

  return (
    <div>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
      <button onClick={() => signOutRedirect()}>Sign out</button>
    </div>
  );
}
