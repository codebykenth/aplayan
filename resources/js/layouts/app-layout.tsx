import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, Briefcase, CalendarIcon, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Menu, Settings, BookmarkIcon, GitCompareArrowsIcon, Target, FileText, Archive, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Auth } from '@/types/auth';

const sidebarLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/job-applications', label: 'Applications', icon: Briefcase },
    { href: '/job-applications/offers', label: 'Offer Comparison', icon: GitCompareArrowsIcon },
    { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { href: '/contacts', label: 'Contacts', icon: Users },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/documents/saved', label: 'Saved Documents', icon: Archive },
    { href: '/templates', label: 'Templates', icon: BookmarkIcon },
    { href: '/settings', label: 'Settings', icon: Settings },
];

function UserAvatar({ user, compact }: { user: Auth['user']; compact?: boolean }) {
    const avatarClass = compact
        ? 'mx-auto h-8 w-8 rounded-full'
        : 'h-8 w-8 shrink-0 rounded-full';
    const fallbackClass = compact
        ? 'mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground'
        : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground';

    if (user?.avatar) {
        return <img src={user.avatar} alt="" className={avatarClass} />;
    }

    return (
        <div className={fallbackClass}>
            {user?.name?.charAt(0)?.toUpperCase()}
        </div>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    useEffect(() => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }, []);

    return (
        <div className="flex h-screen w-full min-w-0 overflow-hidden bg-background">
            <Head />

            {/* Mobile sidebar overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-transform duration-300 ${
                    mobileSidebarOpen
                        ? 'w-64 translate-x-0'
                        : sidebarOpen
                          ? 'w-64 max-md:-translate-x-full'
                          : 'w-64 -translate-x-full md:w-16 md:translate-x-0'
                }`}
            >
                {/* Sidebar header */}
                <div className="flex h-16 shrink-0 items-center border-b border-border px-4">
                    {sidebarOpen && (
                        <>
<Link href="/dashboard" className="text-lg font-semibold text-foreground">
                                Aplayan
                            </Link>
                            <div className="flex-1" />
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="hidden rounded-sm p-1 text-muted-foreground hover:bg-muted md:block"
                                aria-label="Collapse sidebar"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        </>
                    )}
                    {!sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="mx-auto rounded-sm p-1 text-muted-foreground hover:bg-muted"
                            aria-label="Expand sidebar"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Navigation links */}
                <nav className="flex-1 flex flex-col gap-1 overflow-y-auto p-3">
                    {(() => {
                        const activeLink = sidebarLinks.reduce((active, link) => {
                            if (url === link.href || url.startsWith(`${link.href}/`)) {
                                if (!active || link.href.length > active.length) {
                                    return link.href;
                                }
                            }
                            return active;
                        }, '');

                        return sidebarOpen ? (
                            <>
                                {sidebarLinks.map(({ href, label, icon: Icon }) => {
                                    const isActive = activeLink === href;
                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            className={`flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors ${
                                                isActive
                                                    ? 'bg-primary/10 text-primary font-medium'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            {label}
                                        </Link>
                                    );
                                })}
                            </>
                        ) : (
                            <>
                                {sidebarLinks.map(({ href, label, icon: Icon }) => {
                                    const isActive = activeLink === href;
                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            className={`flex items-center justify-center rounded-sm px-2 py-2 transition-colors ${
                                                isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                            title={label}
                                        >
                                            <Icon className="h-5 w-5 shrink-0" />
                                        </Link>
                                    );
                                })}
                            </>
                        );
                    })()}
                </nav>

                {/* User profile footer */}
                {sidebarOpen && (
                    <div className="shrink-0 border-t border-border p-3">
                        <div className="flex items-center gap-3">
                            <UserAvatar user={auth.user} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {auth.user?.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {auth.user?.email}
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="mt-2 flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Link>
                    </div>
                )}

                {/* User avatar only when collapsed */}
                {!sidebarOpen && (
                    <div className="shrink-0 border-t border-border p-2">
                        <UserAvatar user={auth.user} compact />
                    </div>
                )}
            </aside>

            {/* Main content area */}
            <div
                className={`flex h-full min-w-0 flex-1 flex-col transition-all duration-300 ${
                    sidebarOpen ? 'md:ml-64' : 'md:ml-16'
                }`}
            >
                {/* Top bar (mobile only) */}
                <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:hidden">
                    <button
                        onClick={() => setMobileSidebarOpen(true)}
                        aria-label="Open navigation menu"
                    >
                        <Menu className="h-5 w-5 text-foreground" />
                    </button>
                    <Link href="/" className="text-lg font-semibold text-foreground">
                        Aplayan
                    </Link>
                </header>

                <main className="flex flex-1 min-h-0 flex-col overflow-hidden p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}