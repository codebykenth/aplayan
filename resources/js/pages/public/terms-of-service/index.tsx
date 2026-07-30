import React from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/components/ui/application-logo';
import SeoHead from '@/components/ui/seo-head';
import { ArrowLeft, FileCheck, AlertTriangle, Scale, CheckCircle2, UserCheck } from 'lucide-react';
import { home, termsOfService, privacyPolicy } from '@/routes';

export default function TermsOfService() {
    const lastUpdated = 'July 30, 2026';

    return (
        <>
            <SeoHead
                title="Terms of Service"
                description="Review the terms and conditions for using Aplayan. Understand your responsibilities, AI content generation policies, and our service limitations."
                canonicalPath="/terms-of-service"
            />
            <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
                        <Link href={home.url()} className="flex items-center gap-2 transition hover:opacity-90">
                            <ApplicationLogo size="sm" />
                        </Link>
                        <Link
                            href={home.url()}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </div>
                </header>

                {/* Hero Title */}
                <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
                    <div className="mb-10 text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <Scale className="h-3.5 w-3.5" />
                            Terms & Conditions
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                            Terms of Service
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Last Updated: {lastUpdated}
                        </p>
                    </div>

                    {/* Quick Highlights */}
                    <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">User Verification</h3>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                You are responsible for reviewing and verifying all AI-generated content before submitting resumes to employers.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No Hiring Guarantees</h3>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                Aplayan provides application organization tools, but does not guarantee job interviews or hiring success.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Fair Usage</h3>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                Please use the platform lawfully and respectfully without abusing automated systems or AI quotas.
                            </p>
                        </div>
                    </div>

                    {/* Full Document Body */}
                    <div className="prose prose-slate max-w-none rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 dark:prose-invert dark:border-slate-800 dark:bg-slate-900">
                        <section className="mb-8">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                                <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                1. Acceptance of Terms
                            </h2>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                By accessing or using <strong>Aplayan</strong> ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not access or use the application.
                            </p>
                        </section>

                        <section className="mb-8 border-t border-slate-100 pt-6 dark:border-slate-800/80">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                                <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                2. AI Content Generation & User Responsibility
                            </h2>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                Aplayan offers AI-assisted features (such as resume matching, cover letter drafting, and salary insight calculations) powered by third-party language models.
                            </p>
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
                                <li>
                                    <strong>Verification Required:</strong> AI output is provided for assistance purposes only. You are solely responsible for reviewing, factual checking, and ensuring the accuracy of all resume content, experience descriptions, and emails before sending them to recruiters or employers.
                                </li>
                                <li>
                                    <strong>No Misrepresentation:</strong> You agree not to use AI generation to create fraudulent career credentials or intentionally mislead potential employers.
                                </li>
                            </ul>
                        </section>

                        <section className="mb-8 border-t border-slate-100 pt-6 dark:border-slate-800/80">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                                <AlertTriangle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                3. Disclaimer of Warranties & Limitation of Liability
                            </h2>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                Aplayan is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind.
                            </p>
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
                                <li>
                                    <strong>No Guarantee of Employment:</strong> Aplayan is an independent tracking tool. We do not guarantee job callbacks, interview invitations, or employment offers from third-party employers.
                                </li>
                                <li>
                                    <strong>Third-Party Dependencies:</strong> We are not liable for temporary service interruptions caused by third-party providers (such as Google Gemini, Cloudflare, or hosting infrastructure).
                                </li>
                                <li>
                                    <strong>Limitation of Liability:</strong> To the maximum extent permitted by applicable law, the independent developer of Aplayan shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.
                                </li>
                            </ul>
                        </section>

                        <section className="mb-8 border-t border-slate-100 pt-6 dark:border-slate-800/80">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                                <Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                4. Account Termination & Acceptable Use
                            </h2>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                We reserve the right to suspend or terminate account access if a user engages in abusive behavior, attempts to breach system security, or violates these Terms of Service.
                            </p>
                        </section>

                        <section className="border-t border-slate-100 pt-6 dark:border-slate-800/80">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                5. Questions & Support
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                For inquiries regarding these Terms of Service, please contact us at{' '}
                                <a href="mailto:kenthosila@gmail.com" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
                                    kenthosila@gmail.com
                                </a>.
                            </p>
                        </section>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                    <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4">
                        <p>© {new Date().getFullYear()} Aplayan. All rights reserved.</p>
                        <div className="flex items-center gap-4 font-medium">
                            <Link href={termsOfService.url()} className="text-emerald-600 dark:text-emerald-400">
                                Terms of Service
                            </Link>
                            <Link href={privacyPolicy.url()} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
