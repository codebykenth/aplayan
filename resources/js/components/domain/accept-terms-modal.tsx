import { router, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { logout } from '@/routes';
import type { Auth } from '@/types/auth';

export function AcceptTermsModal() {
    const { auth } = usePage<{ auth?: Auth }>().props;
    const user = auth?.user;

    // Show modal if user is logged in but hasn't accepted terms yet
    const isOpen = Boolean(user && !user.terms_accepted_at);

    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    if (!isOpen) {
        return null;
    }

    function handleAccept() {
        if (!agreed || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        router.post(
            '/terms/accept',
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
            },
        );
    }

    function handleLogout() {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);
        router.post(logout.url());
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => {}} disablePointerDismissal>
            <DialogContent
                showCloseButton={false}
                className="max-w-lg gap-5 p-6 sm:p-7"
            >
                <DialogHeader className="gap-1.5 text-left">
                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        Accept Terms & Conditions
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Please review and accept our policies to continue using
                        Aplayan.
                    </DialogDescription>
                </DialogHeader>

                {/* Inner Policy Content Card */}
                <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 text-left text-sm sm:p-5">
                    {/* Terms of Service */}
                    <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">
                            Terms of Service
                        </h3>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            By using Aplayan, you agree to comply with the terms
                            and policies. You are responsible for maintaining
                            account confidentiality and all activities under
                            your account.{' '}
                            <a
                                href="/terms-of-service"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                            >
                                Read full terms of service →
                            </a>
                        </p>
                    </div>

                    {/* Privacy Policy */}
                    <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">
                            Privacy Policy
                        </h3>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Aplayan collects and processes personal data to
                            provide and improve the services. Your data is
                            protected and will not be shared with third parties
                            without consent.{' '}
                            <a
                                href="/privacy-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                            >
                                Read full privacy policy →
                            </a>
                        </p>
                    </div>

                    {/* Your Rights */}
                    <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">
                            Your Rights
                        </h3>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            You have the right to access, modify, or delete your
                            personal data at any time through settings or by
                            contacting our support team.
                        </p>
                    </div>
                </div>

                {/* Agreement Checkbox */}
                <label className="flex cursor-pointer items-start gap-3 text-left select-none">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary/40 focus:ring-offset-background"
                    />
                    <span className="text-xs font-medium text-foreground sm:text-sm">
                        I agree to the Terms of Service and Privacy Policy
                    </span>
                </label>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleLogout}
                        disabled={isSubmitting || isLoggingOut}
                        className="w-full font-semibold tracking-wide uppercase"
                    >
                        {isLoggingOut ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            'LOGOUT'
                        )}
                    </Button>

                    <Button
                        type="button"
                        size="lg"
                        onClick={handleAccept}
                        disabled={!agreed || isSubmitting || isLoggingOut}
                        className="w-full font-semibold tracking-wide uppercase"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            'CONTINUE'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AcceptTermsModal;
