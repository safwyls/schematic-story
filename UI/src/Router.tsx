import { createBrowserRouter, Outlet, useLocation } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import { NotFoundPage } from './pages/NotFound.page'
import { SchematicsPage } from './pages/Schematics.page';
import { SchematicDetailsPage } from './pages/SchematicDetails.page';
import { useEffect } from 'react';
import { Background } from './components/Background/Background';
import { HeaderMegaMenu } from './components/Header/HeaderMegaMenu';
import { ScrollToTop } from './components/Common/ScrollToTop';
import { AccountPage } from './pages/Account.page';
import { UploadPage } from './pages/Upload.page';

function ScrollToHashElement() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return null;
}

function Layout() {
  return (
    <>
      <Background />
      <HeaderMegaMenu />
      <ScrollToTop />
      <ScrollToHashElement />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/schematics', element: <SchematicsPage /> },
      { path: '/schematic/:id', element: <SchematicDetailsPage /> },
      { path: '/account', element: <AccountPage />},      
      { path: '/upload', element: <UploadPage />},
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);


