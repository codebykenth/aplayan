import { Head, Link, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Turnstile from '@/components/Turnstile';

export default function ForgotPassword() {
    const { status, errors: pageErrors } = usePage<{ status?: string; errors: Record<string, string> }>().props;
    const turnstileRef = useRef<{ execute: () => Promise<string | null> }>(null);

    const [email, setEmail] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');

    function submit(e: FormEvent) {
        e.preventDefault();
        submitForm();
    }

    async function submitForm() {
        setTurnstileToken('');
        const token = await turnstileRef.current?.execute();
        setTurnstileToken(token ?? '');
        const form = document.querySelector('form[action="/forgot-password"]') as HTMLFormElement | null;
        form?.submit();
    }

    return (
        <>
            <Head title="Forgot Password" />

            <div className="mx-auto mt-16 w-full max-w-sm">
<h1 className="mb-2 text-2xl font-semibold text-foreground">
                            Reset your password
                        </h1>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Enter your email and we'll send you a reset link.
                        </p>

                {status && (
                    <div className="mb-4 rounded-sm border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                        {status}
                    </div>
                )}

                <form action="/forgot-password" method="POST" onSubmit={submit} className="space-y-4">
                    <input type="hidden" name="_token" value={usePage().props.csrf_token as string} />
                    {turnstileToken && <input type="hidden" name="turnstile" value={turnstileToken} />}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            placeholder="you@example.com"
                        />
                        {pageErrors?.email && (
                            <p className="mt-1 text-sm text-destructive">{pageErrors.email}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <Turnstile
                            siteKey={usePage().props.turnstile_site_key as string}
                            ref={turnstileRef}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg border border-foreground bg-foreground px-5 py-2 text-sm text-background hover:bg-foreground/90"
                    >
                        Send Password Reset Link
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Remember your password?{' '}
                    <Link
                        href="/login"
                        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </>
    );
}