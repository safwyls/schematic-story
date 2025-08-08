import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { mantineTheme } from './theme';
import { HeaderMegaMenu } from './components/Header/HeaderMegaMenu';
import { Background } from './components/Background/Background';

export default function App() {
  return (
    <MantineProvider theme={mantineTheme}>
      <Background />
      <HeaderMegaMenu />
      <Router />
    </MantineProvider>
  );
}
