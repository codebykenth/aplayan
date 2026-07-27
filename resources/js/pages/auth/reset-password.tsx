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
                <h1 className="mb-6 text-2xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                    Reset your password
                </h1>

                <form action="/reset-password" method="POST" onSubmit={submit} className="space-y-4">
                    <input type="hidden" name="_token" value={usePage().props.csrf_token as string} />
                    <input type="hidden" name="token" value={token} />

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            readOnly
                            value={email}
                            className="mt-1 block w-full rounded-sm border border-[#e3e3e0] bg-gray-50 px-3 py-2 text-sm text-[#1b1b18] dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#A1A09A]"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
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
                            className="mt-1 block w-full rounded-sm border border-[#e3e3e0] px-3 py-2 text-sm text-[#1b1b18] placeholder-[#706f6c] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC] dark:placeholder-[#A1A09A]"
                            placeholder="New password"
                        />
                        {pageErrors?.password && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{pageErrors.password}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                            Confirm Password
                        </label>
                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            required
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="mt-1 block w-full rounded-sm border border-[#e3e3e0] px-3 py-2 text-sm text-[#1b1b18] placeholder-[#706f6c] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC] dark:placeholder-[#A1A09A]"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-sm border border-black bg-[#1b1b18] px-5 py-2 text-sm text-white hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
                    >
                        Reset Password
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