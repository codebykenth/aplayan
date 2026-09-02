import { router, usePage } from '@inertiajs/react';
import {
    Mail,
    LogOut,
    CheckCircle2,
    Clock,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import SeoHead from '@/components/ui/seo-head';
import GuestLayout from '@/layouts/guest-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

const COOLDOWN_KEY = 'aplayan_verification_resend_cooldown';
const COOLDOWN_DURATION = 60;

function getRemainingCooldown(): number {
    if (typeof window === 'undefined') {
        return 0;
    }

    const stored = window.sessionStorage.getItem(COOLDOWN_KEY);

    if (!stored) {
        return 0;
    }

    const expiry = parseInt(stored, 10);
    const diff = Math.ceil((expiry - Date.now()) / 1000);

    return diff > 0 ? diff : 0;
}

function setCooldownExpiry(seconds: number) {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.setItem(
        COOLDOWN_KEY,
        (Date.now() + seconds * 1000).toString(),
    );
}

export default function VerifyEmail() {
    const { status, errors } = usePage<{
        status?: string;
        errors?: Record<string, string>;
    }>().props;

    const [cooldown, setCooldown] = useState<number>(() =>
        getRemainingCooldown(),
    );
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const interval = setInterval(() => {
            const remaining = getRemainingCooldown();
            setCooldown(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [cooldown]);

    function handleResend(e: FormEvent) {
        e.preventDefault();

        if (cooldown > 0 || isProcessing) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        router.post(
            send.url(),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCooldownExpiry(COOLDOWN_DURATION);
                    setCooldown(COOLDOWN_DURATION);
                },
                onError: (err) => {
                    const message =
                        err?.email ||
                        err?.message ||
                        errors?.email ||
                        'Too many requests. Please wait a moment before trying again.';
                    setErrorMessage(message);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    }

    function handleLogout(e: FormEvent) {
        e.preventDefault();
        router.post(logout.url());
    }

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
                    <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                        We sent a verification link to your email address.
                        Please click the link in your email to verify your
                        account and get started.
                    </p>

                    {status && (
                        <div
                            role="status"
                            aria-live="polite"
                            className="mb-6 flex w-full items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-left text-sm font-medium text-emerald-600 dark:text-emerald-400"
                        >
                            <CheckCircle2 className="size-5 shrink-0" />
                            <span>{status}</span>
                        </div>
                    )}

                    {errorMessage && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className="mb-6 flex w-full items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-left text-sm font-medium text-destructive"
                        >
                            <AlertCircle className="size-5 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleResend} className="w-full">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={isProcessing || cooldown > 0}
                            className="w-full font-semibold"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Sending verification email...</span>
                                </>
                            ) : cooldown > 0 ? (
                                <>
                                    <Clock className="size-4" />
                                    <span>Resend in {cooldown}s</span>
                                </>
                            ) : (
                                <span>Resend Verification Email</span>
                            )}
                        </Button>
                    </form>

                    <form onSubmit={handleLogout} className="mt-4 w-full">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
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
