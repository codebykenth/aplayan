import { ClockIcon, MessageSquareIcon, RefreshCwIcon, BookmarkIcon, SendIcon, UsersIcon, CheckCircle2Icon, XCircleIcon, XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/types/job-application';
import type { JobApplicationActivity, JobApplicationStatus } from '@/types/job-application';

const ACTIVITY_ICONS = {
    status_update: RefreshCwIcon,
    note: MessageSquareIcon,
};

const ACTIVITY_LABELS = {
    status_update: 'Status Update',
    note: 'Note',
};

const ACTIVITY_COLORS = {
    status_update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    note: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
};

const ACTIVITY_TEXT_COLORS = {
    status_update: 'text-blue-700 dark:text-blue-400',
    note: 'text-amber-700 dark:text-amber-400',
};

const STATUS_ICONS: Record<JobApplicationStatus, any> = {
    wishlist: BookmarkIcon,
    applied: SendIcon,
    interviewing: UsersIcon,
    offer: CheckCircle2Icon,
    rejected: XCircleIcon,
    withdrawn: XIcon,
};

function getStatusFromDescription(description: string): JobApplicationStatus | null {
    const match = description.match(/Status changed to (Wishlist|Applied|Interviewing|Offer|Rejected|Withdrawn)/i);
    if (match) {
        return match[1].toLowerCase() as JobApplicationStatus;
    }
    return null;
}

function getActivityTextColor(type: string, description: string) {
    if (type === 'status_update') {
        const status = getStatusFromDescription(description);
        if (status) {
            const classes = STATUS_COLORS[status];
            return classes.split(' ').filter((c: string) => c.startsWith('text-') || c.startsWith('dark:text-')).join(' ');
        }
    }
    return ACTIVITY_TEXT_COLORS[type as keyof typeof ACTIVITY_TEXT_COLORS] ?? 'text-foreground';
}

function ActivityIcon({ type, description }: { type: string; description: string }) {
    if (type === 'status_update') {
        const status = getStatusFromDescription(description);
        if (status) {
            const Icon = STATUS_ICONS[status] ?? RefreshCwIcon;
            const colors = STATUS_COLORS[status] ?? ACTIVITY_COLORS.status_update;
            return (
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${colors}`}>
                    <Icon className="size-3.5" />
                </div>
            );
        }
    }

    const Icon = ACTIVITY_ICONS[type as keyof typeof ACTIVITY_ICONS] ?? ClockIcon;
    const colors = ACTIVITY_COLORS[type as keyof typeof ACTIVITY_COLORS] ?? 'bg-muted text-muted-foreground';

    return (
        <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${colors}`}>
            <Icon className="size-3.5" />
        </div>
    );
}

function formatActivityDate(date: string): string {
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
        return `${diffMins}m ago`;
    }

    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }

    if (diffDays < 7) {
        return `${diffDays}d ago`;
    }

    return d.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function ActivityTimeline({ activities }: { activities: JobApplicationActivity[] }) {
    if (activities.length === 0) {
        return null;
    }

    const sorted = activities;

    return (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">Activity</span>
            <div className="flex flex-col gap-0 max-h-80 overflow-y-auto pr-2">
                {sorted.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <ActivityIcon type={activity.type} description={activity.description} />
                            {index < sorted.length - 1 && (
                                <div className="w-px flex-1 bg-border mt-1" />
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5 pb-3">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium capitalize ${getActivityTextColor(activity.type, activity.description)}`}>
                                    {ACTIVITY_LABELS[activity.type as keyof typeof ACTIVITY_LABELS] ?? activity.type}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {formatActivityDate(activity.created_at)}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {activity.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}