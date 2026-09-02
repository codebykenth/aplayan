import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ShieldAlert,
    FileQuestion,
    Lock,
    Timer,
    ServerCrash,
    WifiOff,
    Home,
    LayoutDashboard,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/button';
import GuestLayout from '@/layouts/guest-layout';

const ERROR_MAP: Record<
    number,
    { title: string; description: string; icon: typeof AlertTriangle }
> = {
    400: {
        title: 'Bad Request',
        description: 'The request could not be understood by the server.',
        icon: AlertTriangle,
    },
    401: {
        title: 'Unauthorized',
        description: 'You need to sign in to access this page.',
        icon: Lock,
    },
    403: {
        title: 'Forbidden Access',
        description: 'You do not have permission to access this resource.',
        icon: ShieldAlert,
    },
    404: {
        title: 'Page Not Found',
        description:
            'The page you are looking for does not exist or has been moved.',
        icon: FileQuestion,
    },
    405: {
        title: 'Method Not Allowed',
        description: 'This request method is not supported.',
        icon: AlertTriangle,
    },
    419: {
        title: 'Session Expired',
        description:
            'Your session has expired due to inactivity. Please refresh and sign in again.',
        icon: Timer,
    },
    429: {
        title: 'Too Many Requests',
        description:
            'You have made too many requests. Please wait a moment before trying again.',
        icon: Timer,
    },
    500: {
        title: 'Unexpected Error',
        description:
            'Something went wrong on our server. We are looking into it.',
        icon: ServerCrash,
    },
    502: {
        title: 'Bad Gateway',
        description:
            'The server received an invalid response from the upstream service.',
        icon: WifiOff,
    },
    503: {
        title: 'Service Unavailable',
        description:
            'The service is temporarily down for maintenance. Please check back shortly.',
        icon: WifiOff,
    },
};

export default function ErrorPage({ status }: { status: number }) {
    const error = ERROR_MAP[status] ?? ERROR_MAP[500];
    const Icon = error.icon;

    return (
        <>
            <Head title={`${status} - ${error.title}`} />

            <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-6 px-4 py-12 text-center">
                <div className="flex size-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                    <Icon className="size-10" />
                </div>

                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                        Error {status}
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {error.title}
                    </h1>
                    <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                        {error.description}
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Link
                        href="/"
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        <Home className="size-4" />
                        Go Home
                    </Link>

                    <Link
                        href="/dashboard"
                        className={buttonVariants({ variant: 'default' })}
                    >
                        <LayoutDashboard className="size-4" />
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </>
    );
}

ErrorPage.layout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;
