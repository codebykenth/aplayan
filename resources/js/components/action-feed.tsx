import { Link } from '@inertiajs/react';
import {
    Bell,
    Clock,
    CalendarDays,
    Crosshair,
    PhilippinePeso,
    TrendingDown,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { show as showRoute } from '@/routes/job-applications';

export interface ActionItem {
    type: string;
    priority: 'urgent' | 'moderate' | 'low';
    priority_score: number;
    message: string;
    application_id: number;
    company_name: string;
    job_title: string;
    created_at: string;
}

const ACTION_ICONS: Record<string, typeof Clock> = {
    stale_follow_up: Clock,
    upcoming_interview: CalendarDays,
    high_match_wishlist: Crosshair,
    salary_negotiation: PhilippinePeso,
    rejection_momentum: TrendingDown,
};

const PRIORITY_STYLES = {
    urgent: {
        badge: 'destructive' as const,
        border: 'border-l-rose-500 dark:border-l-rose-400',
        dot: 'bg-rose-500',
        label: 'Urgent',
    },
    moderate: {
        badge: 'secondary' as const,
        border: 'border-l-amber-500 dark:border-l-amber-400',
        dot: 'bg-amber-500',
        label: 'Moderate',
    },
    low: {
        badge: 'outline' as const,
        border: 'border-l-sky-500 dark:border-l-sky-400',
        dot: 'bg-sky-500',
        label: 'Low',
    },
};

function ActionCard({
    item,
    onSelectApplication,
}: {
    item: ActionItem;
    onSelectApplication?: (id: number) => void;
}) {
    const Icon = ACTION_ICONS[item.type] ?? Bell;
    const style = PRIORITY_STYLES[item.priority];

    return (
        <div
            className={cn(
                'flex h-full items-start gap-3 rounded-r-xl border-l-[3px] bg-card py-3 pr-3 pl-4 ring-1 ring-foreground/10',
                style.border,
                item.priority === 'urgent' && 'animate-pulse-border',
            )}
        >
            <div
                className={cn(
                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                    item.priority === 'urgent' &&
                        'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
                    item.priority === 'moderate' &&
                        'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
                    item.priority === 'low' &&
                        'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
                )}
            >
                <Icon className="size-4" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                        {item.company_name}
                    </span>
                    <Badge variant={style.badge} className="shrink-0">
                        {style.label}
                    </Badge>
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {item.message}
                </p>
            </div>

            {onSelectApplication ? (
                <button
                    type="button"
                    onClick={() => onSelectApplication(item.application_id)}
                    className="mt-1 flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                    View
                    <ArrowRight className="size-3" />
                </button>
            ) : (
                <Link
                    href={showRoute.url(item.application_id)}
                    className="mt-1 flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                    View
                    <ArrowRight className="size-3" />
                </Link>
            )}
        </div>
    );
}

export default function ActionFeed({
    items,
    onSelectApplication,
}: {
    items: ActionItem[];
    onSelectApplication?: (id: number) => void;
}) {
    const filteredItems = items.filter(
        (item) => item.type !== 'missing_ai_evaluation',
    );
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
        const el = scrollContainerRef.current;

        if (!el) {
            return;
        }

        const left = el.scrollLeft;
        const maxScroll = el.scrollWidth - el.clientWidth;

        setCanScrollLeft(left > 2);
        setCanScrollRight(left < maxScroll - 2);
    }, []);

    useEffect(() => {
        updateScrollState();
        window.addEventListener('resize', updateScrollState);

        return () => window.removeEventListener('resize', updateScrollState);
    }, [items, updateScrollState]);

    if (items.length === 0) {
        return null;
    }

    const urgentCount = items.filter((i) => i.priority === 'urgent').length;

    function scrollLeft() {
        const el = scrollContainerRef.current;

        if (!el) {
            return;
        }

        el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' });
    }

    function scrollRight() {
        const el = scrollContainerRef.current;

        if (!el) {
            return;
        }

        el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
    }

    return (
        <section className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-foreground/5">
                    <Bell className="size-3.5 text-foreground/70" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                    Today's Action Feed
                </h2>
                {urgentCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[11px] leading-none font-medium text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                        {urgentCount} urgent
                    </span>
                )}
                <span className="text-[11px] text-muted-foreground">
                    ({items.length} item{items.length !== 1 ? 's' : ''})
                </span>

                {(canScrollLeft || canScrollRight) && (
                    <div className="ml-auto flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={scrollLeft}
                            disabled={!canScrollLeft}
                            aria-label="Previous actions"
                        >
                            <ChevronLeft className="size-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={scrollRight}
                            disabled={!canScrollRight}
                            aria-label="Next actions"
                        >
                            <ChevronRight className="size-3.5" />
                        </Button>
                    </div>
                )}
            </div>

            <div
                ref={scrollContainerRef}
                onScroll={updateScrollState}
                className="flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto scroll-smooth p-0.5 [&::-webkit-scrollbar]:hidden"
            >
                {items.map((item) => (
                    <div
                        key={`${item.type}-${item.application_id}`}
                        className="w-full shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-1.5rem)/3)]"
                    >
                        <ActionCard
                            item={item}
                            onSelectApplication={onSelectApplication}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
