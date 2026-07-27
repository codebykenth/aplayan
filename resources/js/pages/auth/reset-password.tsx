import { Head, Link, usePage } from '@inertiajs/react';
import {  useState } from 'react';
import type {FormEvent} from 'react';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const { errors: pageErrors } = usePage<{ errors: Record<string, string> }>().props;

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    function submit(e: FormEvent) {
        const form = e.target as HTMLFormElement;
        form.submit();
    }

    return (
        <>
            <Head title="Reset Password" />

            <div className="mx-auto mt-16 w-full max-w-sm">
                <h1 className="mb-6 text-2xl font-semibold text-foreground">
                    Reset your password
                </h1>

                <form action="/reset-password" method="POST" onSubmit={submit} className="space-y-4">
                    <input type="hidden" name="_token" value={usePage().props.csrf_token as string} />
                    <input type="hidden" name="token" value={token} />

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            readOnly
                            value={email}
                            className="mt-1 block w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
                        />
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
                            autoFocus
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            placeholder="New password"
                        />
                        {pageErrors?.password && (
                            <p className="mt-1 text-sm text-destructive">{pageErrors.password}</p>
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
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg border border-foreground bg-foreground px-5 py-2 text-sm text-background hover:bg-foreground/90"
                    >
                        Reset Password
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