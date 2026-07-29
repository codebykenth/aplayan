import { Link } from '@inertiajs/react';
import { ExternalLink, Heart, Sparkles } from 'lucide-react';
import ApplicationLogo from '@/components/ui/application-logo';
import { privacyPolicy, termsOfService } from '@/routes';

export default function Footer() {
    return (
        <footer className="border-t border-border bg-card/40 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand Column */}
                    <div className="space-y-4 md:col-span-2">
                        <Link
                            href="/"
                            className="inline-flex items-center"
                        >
                            <ApplicationLogo />
                        </Link>
                        <p className="max-w-sm text-sm leading-relaxed font-medium text-zinc-600 dark:text-zinc-400">
                            The all-in-one AI-powered job application tracker
                            built specifically for Filipino job seekers. Track
                            applications, calculate take-home pay, and optimize
                            ATS resumes.
                        </p>
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            100% Free Forever for Job Seekers
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                            Product Features
                        </h4>
                        <ul className="mt-4 space-y-2.5 text-sm font-medium">
                            <li>
                                <Link
                                    href="/#ai-match"
                                    className="text-zinc-600 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary"
                                >
                                    AI Match Simulator
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/#salary-calc"
                                    className="text-zinc-600 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary"
                                >
                                    Net Pay Calculator
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/#resume-builder"
                                    className="text-zinc-600 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary"
                                >
                                    ATS Resume Builder
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/#features"
                                    className="text-zinc-600 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary"
                                >
                                    Kanban Job Board
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/#comparison"
                                    className="text-zinc-600 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary"
                                >
                                    Comparison Matrix
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h4 className="text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                            Account & Access
                        </h4>
                        <ul className="mt-4 space-y-2.5 text-sm font-medium">
                            <li>
                                <Link
                                    href="/register"
                                    className="text-zinc-600 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary"
                                >
                                    Create Free Account
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/login"
                                    className="text-zinc-600 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary"
                                >
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/#faq"
                                    className="text-zinc-600 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary"
                                >
                                    Frequently Asked Questions
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={privacyPolicy.url()}
                                    className="text-zinc-600 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={termsOfService.url()}
                                    className="text-zinc-600 transition-colors hover:text-primary dark:text-zinc-400 dark:hover:text-primary"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        &copy; {new Date().getFullYear()} Aplayan. Designed &
                        developed with{' '}
                        <Heart className="inline h-3.5 w-3.5 fill-rose-500 text-rose-500" />{' '}
                        for Filipino job seekers.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-600 sm:gap-6 dark:text-zinc-400">
                        <span className="font-medium text-zinc-500 dark:text-zinc-400">
                            Developer Socials:
                        </span>
                        <a
                            href="https://github.com/codebykenth/codebykenth"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                        >
                            <svg
                                className="h-4 w-4 fill-current text-zinc-700 dark:text-zinc-300"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            <span className="font-semibold text-foreground">
                                GitHub
                            </span>
                        </a>
                        <a
                            href="https://linkedin.com/in/kenthalexisosila"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                        >
                            <svg
                                className="h-4 w-4 fill-current text-zinc-700 dark:text-zinc-300"
                                viewBox="0 0 24 24"
                            >
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                            <span className="font-semibold text-foreground">
                                LinkedIn
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
