import { Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';

export default function VerifyEmail() {
    const { status } = usePage<{ status?: string }>().props;

    return (
        <>
            <Head title="Verify Email" />

            <div className="mx-auto mt-16 w-full max-w-sm text-center">
                <h1 className="mb-2 text-2xl font-semibold text-foreground">
                    Verify your email address
                </h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    Thanks for signing up! Before getting started, could you
                    verify your email address by clicking the link we just
                    emailed to you? If you didn't receive the email, we will
                    gladly send you another.
                </p>

                {status && (
                    <div className="mb-4 rounded-sm border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                        {status}
                    </div>
                )}

                <form action="/email/verification-notification" method="POST">
                    <input
                        type="hidden"
                        name="_token"
                        value={usePage().props.csrf_token as string}
                    />

                    <button
                        type="submit"
                        className="w-full rounded-lg border border-foreground bg-foreground px-5 py-2 text-sm text-background hover:bg-foreground/90"
                    >
                        Resend Verification Email
                    </button>
                </form>

                <form action="/logout" method="POST" className="mt-4">
                    <input
                        type="hidden"
                        name="_token"
                        value={usePage().props.csrf_token as string}
                    />

                    <button
                        type="submit"
                        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                        Logout
                    </button>
                </form>
            </div>
        </>
    );
}

VerifyEmail.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
