import { Head, usePage } from '@inertiajs/react';
import { Mail, LogOut, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';
import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import SeoHead from '@/components/ui/seo-head';

export default function VerifyEmail() {
    const { status } = usePage<{ status?: string }>().props;

    return (
        <>
            <SeoHead
                title="Verify Your Email"
                description="Please verify your email address to access your Aplayan account."
                canonicalPath="/email/verify"
            />

            <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-20">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Mail className="size-7" />
                    </div>

                    <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Check your inbox
                    </h1>
                    <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                        We sent a verification link to your email address. Please click the link in your email to verify your account and get started.
                    </p>

                    {status && (
                        <div className="mb-6 flex w-full items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-left text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-5 shrink-0" />
                            <span>{status}</span>
                        </div>
                    )}

                    <form action="/email/verification-notification" method="POST" className="w-full">
                        <input
                            type="hidden"
                            name="_token"
                            value={usePage().props.csrf_token as string}
                        />

                        <Button type="submit" size="lg" className="w-full font-semibold">
                            Resend Verification Email
                        </Button>
                    </form>

                    <form action="/logout" method="POST" className="mt-4 w-full">
                        <input
                            type="hidden"
                            name="_token"
                            value={usePage().props.csrf_token as string}
                        />

                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <LogOut className="size-3.5" />
                            Sign out of this account
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

VerifyEmail.layout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;
