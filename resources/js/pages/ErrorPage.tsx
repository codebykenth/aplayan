import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    AlertTriangle,
    ShieldAlert,
    FileQuestion,
    Lock,
    Timer,
    ServerCrash,
    WifiOff,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

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
        title: 'Forbidden',
        description: 'You do not have permission to access this resource.',
        icon: ShieldAlert,
    },
    404: {
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist.',
        icon: FileQuestion,
    },
    405: {
        title: 'Method Not Allowed',
        description: 'This request method is not supported.',
        icon: AlertTriangle,
    },
    419: {
        title: 'Session Expired',
        description: 'Your session has expired. Please sign in again.',
        icon: Timer,
    },
    429: {
        title: 'Too Many Requests',
        description:
            'You have made too many requests. Please wait before trying again.',
        icon: Timer,
    },
    500: {
        title: 'Server Error',
        description: 'Something went wrong on our end. Please try again later.',
        icon: ServerCrash,
    },
    502: {
        title: 'Bad Gateway',
        description:
            'The server received an invalid response from the upstream server.',
        icon: WifiOff,
    },
    503: {
        title: 'Service Unavailable',
        description:
            'The service is temporarily unavailable. Please check back later.',
        icon: WifiOff,
    },
};

export default function ErrorPage({ status }: { status: number }) {
    const error = ERROR_MAP[status] ?? ERROR_MAP[500];
    const Icon = error.icon;

    return (
        <>
            <Head title={`${status} - ${error.title}`} />

            <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
                <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
                    <Icon className="size-10 text-destructive" />
                </div>

                <div className="flex flex-col items-center gap-1 text-center">
                    <p className="text-6xl font-bold text-foreground">
                        {status}
                    </p>
                    <h1 className="text-xl font-semibold text-foreground">
                        {error.title}
                    </h1>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        {error.description}
                    </p>
                </div>

                <Link href="/" className={buttonVariants()}>
                    <ArrowLeft className="size-4" />
                    Go Home
                </Link>
            </div>
        </>
    );
}
