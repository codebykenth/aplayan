import { createInertiaApp } from '@inertiajs/react';
import { createRoot, type Root } from 'react-dom/client';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { initTheme, subscribeToThemeChanges } from '@/hooks/use-theme';
import { Toaster } from '@/components/ui/toast';
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
    layout: () => GuestLayout,
    setup({ el, App, props }) {
        if (el == null) return;
        const root =
            (el as unknown as { _inertia_root?: Root })._inertia_root ??
            createRoot(el);
        (el as unknown as { _inertia_root: Root })._inertia_root = root;
        root.render(
            <ThemeProvider>
                <Toaster>
                    <App {...props} />
                </Toaster>
            </ThemeProvider>,
        );
    },
});
