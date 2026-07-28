import { Head, Link, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Auth } from '@/types/auth';
import { registerSchema, validateWithZod } from '@/lib/validations';
import Turnstile from '@/components/Turnstile';

export default function Register() {
    const { errors: pageErrors } = usePage<{ errors: Record<string, string> }>().props;
    const turnstileRef = useRef<{ execute: () => Promise<string | null> }>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const [turnstileToken, setTurnstileToken] = useState('');

    function submit(e: FormEvent) {
        e.preventDefault();

        const validation = validateWithZod(registerSchema, { name, email, password, password_confirmation: passwordConfirmation });

        if (!validation.success) {
            setClientErrors(validation.errors);
            return;
        }

        setClientErrors({});
        submitForm();
    }

    async function submitForm() {
        setTurnstileToken('');
        const token = await turnstileRef.current?.execute();
        setTurnstileToken(token ?? '');
        const form = document.querySelector('form[action="/register"]') as HTMLFormElement | null;
        form?.submit();
    }

    return (
        <>
            <Head title="Register" />

            <div className="mx-auto mt-16 w-full max-w-sm">
                <h1 className="mb-6 text-2xl font-semibold text-foreground">
                    Create your account
                </h1>

                <form action="/register" method="POST" onSubmit={submit} className="space-y-4">
                    <input type="hidden" name="_token" value={usePage().props.csrf_token as string} />
                    {turnstileToken && <input type="hidden" name="turnstile" value={turnstileToken} />}

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground">
                            Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            placeholder="Your name"
                        />
                        {(clientErrors.name || pageErrors?.name) && (
                            <p className="mt-1 text-sm text-destructive">{clientErrors.name || pageErrors?.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            placeholder="you@example.com"
                        />
                        {(clientErrors.email || pageErrors?.email) && (
                            <p className="mt-1 text-sm text-destructive">{clientErrors.email || pageErrors?.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            placeholder="Password"
                        />
                        {(clientErrors.password || pageErrors?.password) && (
                            <p className="mt-1 text-sm text-destructive">{clientErrors.password || pageErrors?.password}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-foreground">
                            Confirm Password
                        </label>
                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            required
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            placeholder="Confirm password"
                        />
                        {(clientErrors.password_confirmation) && (
                            <p className="mt-1 text-sm text-destructive">{clientErrors.password_confirmation}</p>
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
                        Register
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <a
                    href="/auth/google/redirect"
                    className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-5 py-2 text-sm text-foreground hover:bg-muted"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Google
                </a>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
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