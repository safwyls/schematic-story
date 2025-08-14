import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { router } from './Router';
import { mantineTheme } from './theme';
import { RouterProvider } from 'react-router-dom';
import "./App.css";

export default function App() {
  return (
      <MantineProvider theme={mantineTheme}>
        <RouterProvider router={router}/>
      </MantineProvider>
    );
}
