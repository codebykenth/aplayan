import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/components/ui/application-logo';
import { ArrowLeft, Shield, Lock, Eye, Database, Cpu, FileText } from 'lucide-react';
import { home, termsOfService, privacyPolicy } from '@/routes';

export default function PrivacyPolicy() {
    const lastUpdated = 'July 30, 2026';

    return (
        <>
            <Head title="Privacy Policy - Aplayan" />
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
                            <Shield className="h-3.5 w-3.5" />
                            Privacy & Transparency
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                            Privacy Policy
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Last Updated: {lastUpdated}
                        </p>
                    </div>

                    {/* Quick Summary Cards */}
                    <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <Lock className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Data Control</h3>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                You retain full ownership of your resumes, cover letters, and job tracking records.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <Cpu className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Processing</h3>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                Resume text is processed via Google Gemini API solely to generate matches and tailored content.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <Eye className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No Data Sales</h3>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                We never sell, rent, or trade your personal career information to recruiters or advertisers.
                            </p>
                        </div>
                    </div>

                    {/* Full Privacy Document Body */}
                    <div className="prose prose-slate max-w-none rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 dark:prose-invert dark:border-slate-800 dark:bg-slate-900">
                        <section className="mb-8">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                1. Overview
                            </h2>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                Welcome to <strong>Aplayan</strong> ("we", "us", "the Service"). Aplayan is an independent AI-powered job application tracking and resume tailoring platform designed to help job seekers organize their career applications efficiently. We respect your privacy and are committed to protecting the personal data you entrust to us.
                            </p>
                        </section>

                        <section className="mb-8 border-t border-slate-100 pt-6 dark:border-slate-800/80">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                                <Database className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                2. Information We Collect
                            </h2>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                To provide job application tracking and document generation features, we collect the following categories of information:
                            </p>
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
                                <li>
                                    <strong>Account Data:</strong> Name, email address, password hash, and Google OAuth profile information when you register or sign in via Google.
                                </li>
                                <li>
                                    <strong>Career & Application Data:</strong> Resumes, work history, education records, cover letters, contacts, job application titles, salary preferences, and application status logs.
                                </li>
                                <li>
                                    <strong>Technical & Security Metadata:</strong> IP addresses, browser user-agent data, session tokens, and Cloudflare Turnstile anti-bot verification tokens.
                                </li>
                            </ul>
                        </section>

                        <section className="mb-8 border-t border-slate-100 pt-6 dark:border-slate-800/80">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                                <Cpu className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                3. How We Use & Process Your Data
                            </h2>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                We utilize your information strictly to operate, maintain, and improve Aplayan services:
                            </p>
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
                                <li><strong>Job Tracking:</strong> Rendering your Kanban boards, application calendars, and analytics dashboard.</li>
                                <li>
                                    <strong>Third-Party AI Generation (Google Gemini API):</strong> When you request AI resume matching, cover letter drafting, or salary evaluations, the relevant job description and resume text are sent to the <strong>Google Gemini API</strong> solely to process your request.
                                </li>
                                <li><strong>Security & Authentication:</strong> Preventing bot attacks, authenticating user sessions, and maintaining system integrity via Cloudflare.</li>
                            </ul>
                        </section>

                        <section className="mb-8 border-t border-slate-100 pt-6 dark:border-slate-800/80">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                                <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                4. Data Ownership & User Rights
                            </h2>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                You own your career data. In accordance with core privacy principles (including the Philippine Data Privacy Act of 2012 / RA 10173), you have the right to:
                            </p>
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
                                <li>Access, review, and edit your profile, resumes, and job records at any time.</li>
                                <li>Export your job applications as CSV files from your dashboard.</li>
                                <li>Delete specific job records, saved resumes, or your entire account data upon request.</li>
                            </ul>
                        </section>

                        <section className="mb-8 border-t border-slate-100 pt-6 dark:border-slate-800/80">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                                <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                5. Data Storage & Encryption
                            </h2>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                Your data is stored on secured cloud infrastructure with encryption in transit (TLS 1.3) and at rest using AES-256. We do not sell, rent, or trade your personal career information to third parties. Your resumes, application records, and profile data remain strictly within the platform and are never shared with recruiters, advertisers, or external data brokers.
                            </p>
                        </section>

                        <section className="border-t border-slate-100 pt-6 dark:border-slate-800/80">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                6. Contact & Support
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                If you have questions about this Privacy Policy or wish to exercise your data privacy rights, please reach out to us at{' '}
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
                            <Link href={termsOfService.url()} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                                Terms of Service
                            </Link>
                            <Link href={privacyPolicy.url()} className="text-emerald-600 dark:text-emerald-400">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
