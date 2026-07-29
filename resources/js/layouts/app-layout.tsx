import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Briefcase,
    CalendarIcon,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    BookmarkIcon,
    GitCompareArrowsIcon,
    Target,
    FileText,
    Archive,
    Users,
    Sun,
    Moon,
    Monitor,
} from 'lucide-react';
import ApplicationLogo from '@/components/ui/application-logo';
import { useState, useEffect } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/use-theme';
import { privacyPolicy, termsOfService } from '@/routes';
import type { Auth } from '@/types/auth';

const sidebarLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/job-applications', label: 'Applications', icon: Briefcase },
    {
        href: '/job-applications/offers',
        label: 'Offer Comparison',
        icon: GitCompareArrowsIcon,
    },
    { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { href: '/contacts', label: 'Contacts', icon: Users },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/documents/saved', label: 'Saved Documents', icon: Archive },
    { href: '/templates', label: 'Templates', icon: BookmarkIcon },
];

function UserAvatar({
    user,
    compact,
}: {
    user: Auth['user'];
    compact?: boolean;
}) {
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

function UserProfileMenu({
    user,
    isExpanded,
}: {
    user: Auth['user'];
    isExpanded: boolean;
}) {
    const [open, setOpen] = useState(false);
    const { mode, setMode } = useTheme();

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => {
            if (
                !(e.target as Element).closest('.user-profile-menu-container')
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [open]);

    return (
        <div className="user-profile-menu-container relative w-full">
            {/* The Trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`flex w-full items-center gap-3 rounded-md transition-colors hover:bg-muted ${isExpanded ? 'p-2' : 'justify-center p-2'}`}
            >
                <UserAvatar user={user} compact={!isExpanded} />
                {isExpanded && (
                    <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-medium text-foreground">
                            {user?.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                )}
            </button>

            {/* The Dropdown */}
            {open && (
                <div
                    className={`absolute z-50 w-64 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-md ${
                        isExpanded
                            ? 'bottom-full left-0 mb-2'
                            : 'bottom-0 left-full ml-4'
                    }`}
                >
                    <div className="mb-1 border-b border-border px-3 py-2">
                        <p className="truncate text-sm font-medium">
                            {user?.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>

                    <Link
                        href="/settings"
                        className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-muted"
                        onClick={() => setOpen(false)}
                    >
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>

                    <div className="px-3 py-2">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Theme Mode
                        </p>
                        <div className="flex rounded-lg bg-muted/50 p-0.5">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('light');
                                    setOpen(false);
                                }}
                                className={`flex flex-1 justify-center rounded-md py-1.5 text-xs transition-all ${mode === 'light' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                                aria-label="Light mode"
                            >
                                <Sun className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('dark');
                                    setOpen(false);
                                }}
                                className={`flex flex-1 justify-center rounded-md py-1.5 text-xs transition-all ${mode === 'dark' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                                aria-label="Dark mode"
                            >
                                <Moon className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('system');
                                    setOpen(false);
                                }}
                                className={`flex flex-1 justify-center rounded-md py-1.5 text-xs transition-all ${mode === 'system' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                                aria-label="System mode"
                            >
                                <Monitor className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-1 border-t border-border pt-1">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Link>
                    </div>
                </div>
            )}
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

    const isExpanded = sidebarOpen || mobileSidebarOpen;

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
                    {isExpanded && (
                        <>
                            <Link
                                href="/dashboard"
                                className="flex items-center"
                            >
                                <ApplicationLogo />
                            </Link>
                            <div className="flex-1" />
                            <TooltipProvider delay={100}>
                                <Tooltip>
                                    <TooltipTrigger
                                        render={
                                            <button
                                                onClick={() =>
                                                    setSidebarOpen(false)
                                                }
                                                className="hidden rounded-sm p-1 text-muted-foreground hover:bg-muted md:block"
                                                aria-label="Collapse sidebar"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                        }
                                    />
                                    <TooltipContent side="right" sideOffset={8}>
                                        Collapse sidebar
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </>
                    )}
                    {!isExpanded && (
                        <TooltipProvider delay={100}>
                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <button
                                            onClick={() => setSidebarOpen(true)}
                                            className="mx-auto rounded-sm p-1 text-muted-foreground hover:bg-muted"
                                            aria-label="Expand sidebar"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    }
                                />
                                <TooltipContent side="right" sideOffset={12}>
                                    Expand sidebar
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                {/* Navigation links */}
                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
                    {(() => {
                        const activeLink = sidebarLinks.reduce(
                            (active, link) => {
                                if (
                                    url === link.href ||
                                    url.startsWith(`${link.href}/`)
                                ) {
                                    if (
                                        !active ||
                                        link.href.length > active.length
                                    ) {
                                        return link.href;
                                    }
                                }

                                return active;
                            },
                            '',
                        );

                        return isExpanded ? (
                            <>
                                {sidebarLinks.map(
                                    ({ href, label, icon: Icon }) => {
                                        const isActive = activeLink === href;

                                        return (
                                            <Link
                                                key={href}
                                                href={href}
                                                className={`flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors ${
                                                    isActive
                                                        ? 'bg-primary/10 font-medium text-primary'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                            >
                                                <Icon className="h-4 w-4 shrink-0" />
                                                {label}
                                            </Link>
                                        );
                                    },
                                )}
                            </>
                        ) : (
                            <TooltipProvider delay={100}>
                                {sidebarLinks.map(
                                    ({ href, label, icon: Icon }) => {
                                        const isActive = activeLink === href;

                                        return (
                                            <Tooltip key={href}>
                                                <TooltipTrigger
                                                    render={
                                                        <Link
                                                            href={href}
                                                            className={`flex items-center justify-center rounded-sm px-2 py-2 transition-colors ${
                                                                isActive
                                                                    ? 'bg-primary/10 text-primary'
                                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                            }`}
                                                        >
                                                            <Icon className="h-5 w-5 shrink-0" />
                                                        </Link>
                                                    }
                                                />
                                                <TooltipContent
                                                    side="right"
                                                    sideOffset={12}
                                                >
                                                    {label}
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    },
                                )}
                            </TooltipProvider>
                        );
                    })()}
                </nav>

                {/* User profile footer */}
                <div
                    className={`shrink-0 border-t border-border ${isExpanded ? 'p-2' : 'flex justify-center p-2'}`}
                >
                    <UserProfileMenu user={auth.user} isExpanded={isExpanded} />
                </div>

                {/* Legal links */}
                <div
                    className={`shrink-0 border-t border-border px-3 py-2 text-xs text-muted-foreground ${isExpanded ? '' : 'hidden'}`}
                >
                    <div className="flex items-center justify-center gap-3">
                        <Link href={privacyPolicy.url()} className="hover:text-foreground transition-colors">
                            Privacy
                        </Link>
                        <span className="text-border">|</span>
                        <Link href={termsOfService.url()} className="hover:text-foreground transition-colors">
                            Terms
                        </Link>
                    </div>
                </div>
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
                    <Link
                        href="/"
                        className="flex items-center"
                    >
                        <ApplicationLogo />
                    </Link>
                </header>

                <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
