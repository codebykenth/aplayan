import { createInertiaApp } from '@inertiajs/react';
import {  useEffect } from 'react';
import type {ReactNode} from 'react';
import { initTheme, subscribeToThemeChanges } from '@/hooks/use-theme';
import GuestLayout from './layouts/guest-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function ThemeProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        initTheme();
        const unsubscribe = subscribeToThemeChanges();

        return unsubscribe;
    }, []);

    return children;
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        const page = pages[`./pages/${name}.tsx`] as {
            default: React.ComponentType<Record<string, unknown>> & { layout?: (page: ReactNode) => ReactNode };
        };
        page.default.layout ??= (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;

        return page;
    },
    withApp(app) {
        return <ThemeProvider>{app}</ThemeProvider>;
    },
});