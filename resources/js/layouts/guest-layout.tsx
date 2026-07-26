import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Head />
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                <header className="border-b border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                            Aplayan
                        </Link>

                        <nav className="hidden items-center gap-6 sm:flex">
                            <Link
                                href="/#features"
                                className="text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                            >
                                Features
                            </Link>
                            <Link
                                href="/login"
                                className="text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-sm border border-[#1b1b18] bg-[#1b1b18] px-4 py-1.5 text-sm text-white hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
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
                                <X className="h-6 w-6 text-[#1b1b18] dark:text-[#EDEDEC]" />
                            ) : (
                                <Menu className="h-6 w-6 text-[#1b1b18] dark:text-[#EDEDEC]" />
                            )}
                        </button>
                    </div>

                    {mobileMenuOpen && (
                        <div className="border-t border-[#e3e3e0] px-4 py-4 sm:hidden dark:border-[#3E3E3A]">
                            <nav className="flex flex-col gap-4">
                                <Link
                                    href="/#features"
                                    className="text-sm text-[#706f6c] dark:text-[#A1A09A]"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Features
                                </Link>
                                <Link
                                    href="/login"
                                    className="text-sm text-[#706f6c] dark:text-[#A1A09A]"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-block rounded-sm border border-[#1b1b18] bg-[#1b1b18] px-4 py-1.5 text-center text-sm text-white dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A]"
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