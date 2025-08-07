import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { blueprintTheme } from './theme';
import { HeaderMegaMenu } from './components/Header/HeaderMegaMenu';
import { NebulaBackground } from './components/Background/NebulaBackground';

export default function App() {
  return (
    <MantineProvider theme={blueprintTheme}>
      <HeaderMegaMenu />
      <Router />
    </MantineProvider>
  );
}
