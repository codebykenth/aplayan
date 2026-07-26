import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            csrf_token: string;
            status?: string;
            errors: Record<string, string>;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}