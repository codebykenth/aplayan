import { Head, Link } from '@inertiajs/react';
import { BarChart3, Briefcase, Sparkles, Target } from 'lucide-react';

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
        icon: Briefcase,
        title: 'Track Applications',
        description:
            'Organize every application in one place. Track status, add notes, set reminders, and never lose sight of your job search.',
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
            <Head title="Welcome" />

            {/* Hero section */}
            <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
                <div className="mx-auto max-w-5xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        Land Your Dream Job with{' '}
                        <span className="text-[#f53003] dark:text-[#FF4433]">AI-Powered</span> Insights
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                        Stop guessing how your resume stacks up. Aplayan analyzes your applications against real job
                        descriptions, gives you an AI match score, and reveals salary benchmarks — so you walk into
                        every interview with confidence.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="rounded-sm border border-foreground bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            href="/login"
                            className="rounded-sm border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Subtle decorative gradient */}
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#f53003] to-[#ff8c00] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>
            </section>

            {/* Features section */}
            <section id="features" className="border-t border-border px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Everything you need to land the role
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Smart tools that give you an edge in today&apos;s competitive job market.
                        </p>
                    </div>
                    <div className="mt-16 grid gap-8 sm:grid-cols-2">
                        {features.map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className="rounded-sm border border-border bg-card p-6"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-background">
                                    <Icon className="h-5 w-5 text-[#f53003] dark:text-[#FF4433]" />
                                </div>
                                <h3 className="mt-4 text-base font-semibold text-foreground">
                                    {title}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA section */}
            <section className="border-t border-border px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Ready to take control of your job search?
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Join Aplayan and start getting AI-powered insights on every application.
                    </p>
                    <div className="mt-8">
                        <Link
                            href="/register"
                            className="inline-block rounded-sm border border-foreground bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90"
                        >
                            Create your free account
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}