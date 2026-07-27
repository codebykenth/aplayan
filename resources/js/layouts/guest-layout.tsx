import { Head, Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Head />
            <div className="flex min-h-screen flex-col bg-background">
                <header className="border-b border-border bg-background">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="text-lg font-semibold text-foreground">
                            Aplayan
                        </Link>

                        <nav className="hidden items-center gap-6 sm:flex">
                            <Link
                                href="/#features"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Features
                            </Link>
                            <Link
                                href="/login"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-sm border border-foreground bg-foreground px-4 py-1.5 text-sm text-background hover:bg-foreground/90 dark:border-foreground dark:bg-foreground dark:text-background dark:hover:bg-foreground/90"
                            >
                                Get Started
                            </Link>
                        </nav>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="sm:hidden"
                            aria-label="Toggle navigation menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6 text-foreground" />
                            ) : (
                                <Menu className="h-6 w-6 text-foreground" />
                            )}
                        </button>
                    </div>

                    {mobileMenuOpen && (
                        <div className="border-t border-border px-4 py-4 sm:hidden">
                            <nav className="flex flex-col gap-4">
                                <Link
                                    href="/#features"
                                    className="text-sm text-muted-foreground"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Features
                                </Link>
                                <Link
                                    href="/login"
                                    className="text-sm text-muted-foreground"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-block rounded-sm border border-foreground bg-foreground px-4 py-1.5 text-center text-sm text-background"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </nav>
                        </div>
                    )}
                </header>

                <main className="flex-1">{children}</main>
            </div>
        </>
    );
}