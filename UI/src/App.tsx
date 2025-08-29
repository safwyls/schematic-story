import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { router } from './Router';
import { mantineTheme } from './theme';
import { RouterProvider } from 'react-router-dom';
import { useAuthStore } from "@/store/AuthStore";
import { userManager } from './main';
import { useEffect } from 'react';
import "./App.css";

export default function App() {  
    const { setFromOidcUser } = useAuthStore();
    
    useEffect(() => {
        const onLoaded = (u: any) => {
            console.log('User login successful', u);
            setFromOidcUser(u);
        };

        userManager.events.addUserLoaded(onLoaded);
        return () => userManager.events.removeUserLoaded(onLoaded);
    }, [setFromOidcUser])

    return (
        <MantineProvider theme={mantineTheme}>
            <Notifications />
            <RouterProvider router={router}/>
        </MantineProvider>
    );
}
