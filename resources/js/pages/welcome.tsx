import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Briefcase,
    LayoutDashboard,
    Sparkles,
    Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SeoHead from '@/components/ui/seo-head';
import AiMatchSimulator from '@/components/landing/ai-match-simulator';
import PhPayCalculatorWidget from '@/components/landing/ph-pay-calculator-widget';
import AtsResumePreviewer from '@/components/landing/ats-resume-previewer';
import ComparisonMatrix from '@/components/landing/comparison-matrix';
import FaqAccordion from '@/components/landing/faq-accordion';

const softwareApplicationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Aplayan',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
        'Aplayan analyzes your resume against real job descriptions, gives you an AI match score, reveals salary benchmarks with Philippine statutory tax computation.',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
};

const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Aplayan',
    url: window.location.origin,
    description:
        'AI-Powered Job Search & Resume Tracker for Filipino job seekers.',
};

const features = [
    {
        icon: Sparkles,
        title: 'AI Resume Match',
        description:
            'Upload your resume and see exactly how it matches each job description. Get a percentage score and actionable improvement tips.',
    },
    {
        icon: BarChart3,
        title: 'Salary Reality Check',
        description:
            'Know your worth with real-time market salary data. Compare offers, negotiate with confidence, and never undervalue yourself.',
    },
    {
        icon: LayoutDashboard,
        title: 'Kanban Job Board',
        description:
            'Organize every application with drag-and-drop boards. Track status, add notes, set reminders, and never lose sight of your job search.',
    },
    {
        icon: Target,
        title: 'Smart Insights',
        description:
            'Get personalized recommendations on which jobs to prioritize, which skills to highlight, and how to stand out from the crowd.',
    },
];

export default function Welcome() {
    return (
        <>
            <SeoHead
                title="Welcome"
                jsonLd={[softwareApplicationJsonLd, websiteJsonLd]}
            />

            {/* Hero section */}
            <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
                <div className="mx-auto max-w-5xl text-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3.5 py-1 text-xs font-semibold text-zinc-700 shadow-xs backdrop-blur-sm dark:text-zinc-200">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        AI-Powered Job Application Management for Filipinos
                    </div>
                    <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        Land Your Dream Job in the{' '}
                        <span className="text-primary">Philippines</span> with
                        AI-Powered Insights
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-base font-normal text-zinc-600 sm:text-lg dark:text-zinc-300">
                        Stop guessing how your resume stacks up. Aplayan
                        analyzes your applications against real job
                        descriptions, gives you an AI match score, reveals
                        salary benchmarks with Philippine statutory tax
                        computation — so you walk into every interview with
                        confidence.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button
                            size="lg"
                            className="h-11 w-full px-6 py-3 text-base font-semibold shadow-xs sm:w-auto"
                            as-child
                        >
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <span>Get Started Free</span>
                                <ArrowRight className="h-4.5 w-4.5 shrink-0" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-11 w-full px-6 py-3 text-base font-semibold sm:w-auto"
                            as-child
                        >
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center whitespace-nowrap"
                            >
                                Sign In
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* AI Match Simulator */}
                <div
                    id="ai-match"
                    className="mx-auto mt-16 max-w-3xl scroll-mt-20"
                >
                    <div className="mb-4 text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            AI Match Simulator
                        </h2>
                        <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            See how Aplayan analyzes your resume fit for any
                            role
                        </p>
                    </div>
                    <AiMatchSimulator />
                </div>

                <div
                    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                    aria-hidden="true"
                >
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary/30 opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>
            </section>

            {/* Philippine Net Pay Calculator */}
            <section
                id="salary-calc"
                className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
            >
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Know Your Take-Home Pay
                        </h2>
                        <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            Instantly compute SSS, PhilHealth, Pag-IBIG, and BIR
                            income tax for any salary.
                        </p>
                    </div>
                    <PhPayCalculatorWidget />
                </div>
            </section>

            {/* ATS Resume Preview */}
            <section
                id="resume-builder"
                className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
            >
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            ATS-Optimized Resume Templates
                        </h2>
                        <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            Preview how your resume looks in two professionally
                            designed ATS-friendly formats.
                        </p>
                    </div>
                    <AtsResumePreviewer />
                </div>
            </section>

            {/* Features section */}
            <section
                id="features"
                className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
            >
                <div className="mx-auto max-w-5xl">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Everything you need to land the role
                        </h2>
                        <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            Smart tools that give you an edge in today&apos;s
                            competitive job market.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-6 sm:grid-cols-2">
                        {features.map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className="group rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm transition-all hover:border-foreground/30 hover:bg-card/90"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/80">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="mt-4 text-base font-bold text-foreground">
                                    {title}
                                </h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Matrix */}
            <section
                id="comparison"
                className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
            >
                <div className="mx-auto max-w-4xl">
                    <ComparisonMatrix />
                </div>
            </section>

            {/* FAQ */}
            <section
                id="faq"
                className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
            >
                <div className="mx-auto max-w-3xl">
                    <FaqAccordion />
                </div>
            </section>

            {/* Final CTA */}
            <section className="border-t border-border px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="rounded-2xl border border-border bg-gradient-to-br from-card/90 to-card/50 p-8 shadow-sm backdrop-blur-sm sm:p-12">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Ready to take control of your job applications?
                        </h2>
                        <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                            Join thousands of Filipino job seekers who land more
                            interviews with Aplayan&apos;s AI-powered insights.
                            No credit card required.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button
                                size="lg"
                                className="h-11 w-full px-6 py-3 text-base font-semibold shadow-xs sm:w-auto"
                                as-child
                            >
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    <span>Get Started Free</span>
                                    <ArrowRight className="h-4.5 w-4.5 shrink-0" />
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-11 w-full px-6 py-3 text-base font-semibold sm:w-auto"
                                as-child
                            >
                                <Link
                                    href="/auth/google/redirect"
                                    className="inline-flex items-center justify-center whitespace-nowrap"
                                >
                                    Sign in with Google
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
