import { Link } from '@inertiajs/react';
import {
    Clock,
    RefreshCw,
    PlusCircle,
    MessageSquare,
    Phone,
    Sparkles,
    History,
    ExternalLink,
    ArrowRight,
    Bookmark,
    Send,
    Users,
    CheckCircle2,
    XCircle,
    X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { index as jobAppsIndex } from '@/routes/job-applications';
import { STATUS_COLORS } from '@/types/job-application';
import type {
    JobApplicationActivity,
    JobApplicationStatus,
} from '@/types/job-application';

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

const STATUS_ICONS: Record<JobApplicationStatus, typeof Clock> = {
    wishlist: Bookmark,
    applied: Send,
    interviewing: Users,
    offer: CheckCircle2,
    rejected: XCircle,
    withdrawn: X,
};

function getStatusFromDescription(
    description: string,
): JobApplicationStatus | null {
    const match = description.match(
        /Status changed to (Wishlist|Applied|Interviewing|Offer|Rejected|Withdrawn)/i,
    );
    if (match) {
        return match[1].toLowerCase() as JobApplicationStatus;
    }
    return null;
}

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

    if (diffMins < 1) {
        return 'Just now';
    }

    if (diffMins < 60) {
        return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    }

    if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }

    if (diffDays < 7) {
        return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }

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
    let Icon = ACTIVITY_ICONS[item.type] ?? Clock;
    let iconColor =
        ACTIVITY_COLORS[item.type] ?? 'bg-muted text-muted-foreground';
    let customBadgeClass = '';

    if (item.type === 'status_update') {
        const status = getStatusFromDescription(item.description);
        if (status) {
            Icon = STATUS_ICONS[status] ?? RefreshCw;
            iconColor = STATUS_COLORS[status] ?? iconColor;
            customBadgeClass = STATUS_COLORS[status] ?? '';
        }
    }

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
                    {customBadgeClass ? (
                        <div
                            className={cn(
                                'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] leading-none font-semibold transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden',
                                customBadgeClass,
                            )}
                        >
                            {ACTIVITY_LABELS[item.type] ?? item.type}
                        </div>
                    ) : (
                        <Badge
                            variant={
                                ACTIVITY_BADGE_VARIANTS[item.type] ?? 'outline'
                            }
                            className="shrink-0 text-[10px] leading-none"
                        >
                            {ACTIVITY_LABELS[item.type] ?? item.type}
                        </Badge>
                    )}
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
    className,
}: {
    items: RecentActivityItem[];
    onSelectApplication: (applicationId: number) => void;
    className?: string;
}) {
    return (
        <Card
            size="sm"
            className={cn(
                'flex h-full max-h-[520px] min-h-0 flex-col',
                className,
            )}
        >
            <CardHeader className="shrink-0">
                <CardTitle className="flex items-center gap-2">
                    <div className="flex size-5 items-center justify-center rounded-md bg-foreground/5">
                        <History className="size-3 text-foreground/70" />
                    </div>
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[460px] min-h-0 flex-1 overflow-y-auto px-0">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 px-(--card-spacing) py-8 text-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                            <History className="size-5 text-muted-foreground/50" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                No activity yet
                            </p>
                            <p className="mt-1 max-w-44 text-xs text-muted-foreground">
                                Activities from your job applications will
                                appear here as you make progress.
                            </p>
                        </div>
                        <Link href={jobAppsIndex.url()}>
                            <Button variant="outline" size="sm">
                                Add your first application
                                <ArrowRight className="size-3" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-0 px-1">
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
