import { createInertiaApp } from '@inertiajs/react';
import { type ReactNode } from 'react';
import AppLayout from './layouts/app-layout';

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
        page.default.layout ??= (page: ReactNode) => <AppLayout>{page}</AppLayout>;
        return page;
    },
});