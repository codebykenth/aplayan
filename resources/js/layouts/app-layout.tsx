import type { Auth } from '@/types/auth';
import { Head, Link, usePage } from '@inertiajs/react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title="Aplayan" />
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                <header className="border-b border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                            Aplayan
                        </Link>

                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <>
                                    {auth.user.avatar && (
                                        <img
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                            className="h-8 w-8 rounded-full"
                                        />
                                    )}
                                    <div className="text-right text-sm leading-tight">
                                        <div className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            {auth.user.name}
                                        </div>
                                        <div className="text-[#706f6c] dark:text-[#A1A09A]">
                                            {auth.user.email}
                                        </div>
                                    </div>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="rounded-sm border border-[#e3e3e0] px-4 py-1.5 text-sm text-[#706f6c] hover:border-[#1b1b18] hover:text-[#1b1b18] dark:border-[#3E3E3A] dark:text-[#A1A09A] dark:hover:border-[#EDEDEC] dark:hover:text-[#EDEDEC]"
                                    >
                                        Logout
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-sm border border-[#e3e3e0] px-4 py-1.5 text-sm text-[#1b1b18] hover:border-[#1b1b18] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#EDEDEC]"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </>
    );
}