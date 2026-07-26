import { Head, Link, usePage } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';

export default function ForgotPassword() {
    const { status, errors: pageErrors } = usePage<{ status?: string; errors: Record<string, string> }>().props;

    const [email, setEmail] = useState('');

    function submit(e: FormEvent) {
        const form = e.target as HTMLFormElement;
        form.submit();
    }

    return (
        <>
            <Head title="Forgot Password" />

            <div className="mx-auto mt-16 w-full max-w-sm">
                <h1 className="mb-2 text-2xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                    Forgot your password?
                </h1>
                <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    No problem. Just let us know your email address and we will email you a password reset link.
                </p>

                {status && (
                    <div className="mb-4 rounded-sm border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                        {status}
                    </div>
                )}

                <form action="/forgot-password" method="POST" onSubmit={submit} className="space-y-4">
                    <input type="hidden" name="_token" value={usePage().props.csrf_token as string} />

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
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
                            className="mt-1 block w-full rounded-sm border border-[#e3e3e0] px-3 py-2 text-sm text-[#1b1b18] placeholder-[#706f6c] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC] dark:placeholder-[#A1A09A]"
                            placeholder="you@example.com"
                        />
                        {pageErrors?.email && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{pageErrors.email}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-sm border border-black bg-[#1b1b18] px-5 py-2 text-sm text-white hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
                    >
                        Send Password Reset Link
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Remember your password?{' '}
                    <Link
                        href="/login"
                        className="font-medium text-[#f53003] underline underline-offset-4 hover:text-[#d42d00] dark:text-[#FF4433]"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </>
    );
}