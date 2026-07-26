import { createInertiaApp } from '@inertiajs/react';
import { type ReactNode, useEffect } from 'react';
import GuestLayout from './layouts/guest-layout';
import { initTheme, subscribeToThemeChanges } from '@/hooks/use-theme';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

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
    setup({ App, props }) {
        function AppWithTheme() {
            useEffect(() => {
                initTheme();
                const unsubscribe = subscribeToThemeChanges();
                return unsubscribe;
            }, []);

            return <App {...props} />;
        }

        return <AppWithTheme />;
    },
});