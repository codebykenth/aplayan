import { Head, Link, usePage } from '@inertiajs/react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/landing/footer';
import ApplicationLogo from '@/components/ui/application-logo';
import { buttonVariants } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types/auth';

const navLinks = [
    { href: '/#ai-match', label: 'AI Match' },
    { href: '/#salary-calc', label: 'Salary Calculator' },
    { href: '/#resume-builder', label: 'Resume Builder' },
    { href: '/#features', label: 'Features' },
    { href: '/#comparison', label: 'Comparison' },
    { href: '/#faq', label: 'FAQ' },
];

function ThemeToggle() {
    const { mode, setMode } = useTheme();

    const isDark = mode === 'dark';

    return (
        <button
            onClick={() => setMode(isDark ? 'light' : 'dark')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </button>
    );
}

function MobileMenu({
    open,
    onClose,
    user,
}: {
    open: boolean;
    onClose: () => void;
    user?: Auth['user'];
}) {
    const { mode, setMode } = useTheme();

    const isDark = mode === 'dark';

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}
            <div
                className={cn(
                    'fixed inset-y-0 right-0 z-50 w-72 border-l border-border bg-background p-6 shadow-xl transition-transform duration-300 lg:hidden',
                    open ? 'translate-x-0' : 'translate-x-full',
                )}
            >
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center"
                        onClick={onClose}
                    >
                        <ApplicationLogo />
                    </Link>
                    <button
                        onClick={onClose}
                        aria-label="Close navigation menu"
                    >
                        <X className="h-5 w-5 text-foreground" />
                    </button>
                </div>

                <nav className="mt-8 flex flex-col gap-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            onClick={onClose}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-6 border-t border-border pt-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMode(isDark ? 'light' : 'dark')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground"
                            aria-label={
                                isDark
                                    ? 'Switch to light mode'
                                    : 'Switch to dark mode'
                            }
                        >
                            {isDark ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </button>
                        <span className="text-sm text-muted-foreground">
                            {isDark ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                    {user ? (
                        <Link
                            href={
                                user.role === 'admin'
                                    ? '/admin/dashboard'
                                    : '/dashboard'
                            }
                            className="block rounded-lg bg-foreground px-3 py-2 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                            onClick={onClose}
                        >
                            {user.role === 'admin'
                                ? 'Admin Dashboard'
                                : 'Go to Dashboard'}
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                onClick={onClose}
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className="block rounded-lg bg-foreground px-3 py-2 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                                onClick={onClose}
                            >
                                Get Started Free
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { auth } = usePage<{ auth?: Auth }>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Head />
            <div className="flex min-h-screen flex-col bg-background">
                <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex shrink-0 items-center">
                            <ApplicationLogo />
                        </Link>

                        <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="rounded-lg px-2 py-1.5 text-xs font-medium whitespace-nowrap text-zinc-600 transition-colors hover:bg-muted hover:text-foreground xl:px-3 xl:text-sm dark:text-zinc-300"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="hidden items-center gap-2.5 lg:flex">
                            <ThemeToggle />

                            {auth?.user ? (
                                <Link
                                    href={
                                        auth.user.role === 'admin'
                                            ? '/admin/dashboard'
                                            : '/dashboard'
                                    }
                                    className={cn(
                                        buttonVariants(),
                                        'shrink-0 px-4 font-semibold',
                                    )}
                                >
                                    {auth.user.role === 'admin'
                                        ? 'Admin Dashboard'
                                        : 'Go to Dashboard'}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-sm font-medium whitespace-nowrap text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-300"
                                    >
                                        Sign In
                                    </Link>

                                    <Link
                                        href="/register"
                                        className={cn(
                                            buttonVariants(),
                                            'shrink-0 px-4 font-semibold',
                                        )}
                                    >
                                        Get Started Free
                                    </Link>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="flex items-center lg:hidden"
                            aria-label="Open navigation menu"
                        >
                            <Menu className="h-5 w-5 text-foreground" />
                        </button>
                    </div>
                </header>

                <MobileMenu
                    open={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                    user={auth?.user}
                />

                <main className="flex-1">{children}</main>
                <Footer />
            </div>
        </>
    );
}
