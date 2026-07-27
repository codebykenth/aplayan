import { Link } from '@inertiajs/react';
import { show as showRoute } from '@/routes/job-applications';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Bell,
    Clock,
    CalendarDays,
    Crosshair,
    Search,
    PhilippinePeso,
    TrendingDown,
    ArrowRight,
} from 'lucide-react';

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
    missing_ai_evaluation: Search,
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

function ActionCard({ item }: { item: ActionItem }) {
    const Icon = ACTION_ICONS[item.type] ?? Bell;
    const style = PRIORITY_STYLES[item.priority];

    return (
        <div
            className={cn(
                'flex items-start gap-3 border-l-[3px] bg-card py-3 pl-4 pr-3 ring-1 ring-foreground/10 rounded-r-xl',
                style.border,
                item.priority === 'urgent' && 'animate-pulse-border',
            )}
        >
            <div
                className={cn(
                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                    item.priority === 'urgent' && 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
                    item.priority === 'moderate' && 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
                    item.priority === 'low' && 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
                )}
            >
                <Icon className="size-4" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground truncate">
                        {item.company_name}
                    </span>
                    <Badge variant={style.badge} className="shrink-0">
                        {style.label}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.message}
                </p>
            </div>

            <Link
                href={showRoute.url(item.application_id)}
                className="mt-1 flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
                View
                <ArrowRight className="size-3" />
            </Link>
        </div>
    );
}

export default function ActionFeed({ items }: { items: ActionItem[] }) {
    if (items.length === 0) {
        return null;
    }

    const urgentCount = items.filter((i) => i.priority === 'urgent').length;

    return (
        <section>
            <div className="flex items-center gap-2 mb-3">
                <div className="flex size-6 items-center justify-center rounded-md bg-foreground/5">
                    <Bell className="size-3.5 text-foreground/70" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                    Today's Action Feed
                </h2>
                {urgentCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[11px] font-medium text-rose-600 dark:bg-rose-900/30 dark:text-rose-300 leading-none">
                        {urgentCount} urgent
                    </span>
                )}
                <span className="text-[11px] text-muted-foreground ml-auto">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="flex flex-col gap-2">
                {items.map((item) => (
                    <ActionCard key={`${item.type}-${item.application_id}`} item={item} />
                ))}
            </div>
        </section>
    );
}
