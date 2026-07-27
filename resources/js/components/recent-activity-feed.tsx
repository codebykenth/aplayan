import {
    Clock,
    RefreshCw,
    PlusCircle,
    MessageSquare,
    Phone,
    Sparkles,
    History,
    ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { JobApplicationActivity } from '@/types/job-application';

export interface RecentActivityItem extends Omit<
    JobApplicationActivity,
    'type'
> {
    type: string;
    company_name: string;
    job_title: string;
    job_application_id: number;
}

const ACTIVITY_ICONS: Record<string, typeof Clock> = {
    status_update: RefreshCw,
    created: PlusCircle,
    note: MessageSquare,
    contacted: Phone,
    ai_evaluated: Sparkles,
};

const ACTIVITY_LABELS: Record<string, string> = {
    status_update: 'Status Update',
    created: 'Created',
    note: 'Note',
    contacted: 'Contacted',
    ai_evaluated: 'AI Evaluation',
};

const ACTIVITY_BADGE_VARIANTS: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
> = {
    status_update: 'default',
    created: 'outline',
    note: 'secondary',
    contacted: 'ghost',
    ai_evaluated: 'default',
};

const ACTIVITY_COLORS: Record<string, string> = {
    status_update:
        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
    created:
        'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
    note: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    contacted:
        'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
    ai_evaluated:
        'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
};

function formatRelativeTime(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
    });
}

function ActivityCard({
    item,
    onSelect,
}: {
    item: RecentActivityItem;
    onSelect: (applicationId: number) => void;
}) {
    const Icon = ACTIVITY_ICONS[item.type] ?? Clock;
    const iconColor =
        ACTIVITY_COLORS[item.type] ?? 'bg-muted text-muted-foreground';

    return (
        <button
            type="button"
            onClick={() => onSelect(item.job_application_id)}
            className="group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
            <div
                className={cn(
                    'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md',
                    iconColor,
                )}
            >
                <Icon className="size-3.5" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                        {item.company_name}
                    </span>
                    <Badge
                        variant={
                            ACTIVITY_BADGE_VARIANTS[item.type] ?? 'outline'
                        }
                        className="shrink-0 text-[10px] leading-none"
                    >
                        {ACTIVITY_LABELS[item.type] ?? item.type}
                    </Badge>
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                    {item.description}
                </p>
                <span className="text-[11px] text-muted-foreground/60">
                    {formatRelativeTime(item.created_at)}
                </span>
            </div>

            <ExternalLink className="mt-1 size-3 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
        </button>
    );
}

export default function RecentActivityFeed({
    items,
    onSelectApplication,
}: {
    items: RecentActivityItem[];
    onSelectApplication: (applicationId: number) => void;
}) {
    return (
        <Card size="sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="flex size-5 items-center justify-center rounded-md bg-foreground/5">
                        <History className="size-3 text-foreground/70" />
                    </div>
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-(--card-spacing) py-8 text-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                            <History className="size-5 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            No activity yet
                        </p>
                        <p className="max-w-44 text-xs text-muted-foreground">
                            Activities from your job applications will appear
                            here as you make progress.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-0">
                        {items.map((item) => (
                            <ActivityCard
                                key={`${item.id}`}
                                item={item}
                                onSelect={onSelectApplication}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
