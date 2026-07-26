import { ClockIcon, MessageSquareIcon, RefreshCwIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { JobApplicationActivity } from '@/types/job-application';

const ACTIVITY_ICONS = {
    status_update: RefreshCwIcon,
    note: MessageSquareIcon,
};

const ACTIVITY_LABELS = {
    status_update: 'Status Update',
    note: 'Note',
};

function ActivityIcon({ type }: { type: string }) {
    const Icon = ACTIVITY_ICONS[type as keyof typeof ACTIVITY_ICONS] ?? ClockIcon;

    return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
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

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function ActivityTimeline({ activities }: { activities: JobApplicationActivity[] }) {
    if (activities.length === 0) return null;

    const sorted = activities;

    return (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">Activity</span>
            <div className="flex flex-col gap-0">
                {sorted.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <ActivityIcon type={activity.type} />
                            {index < sorted.length - 1 && (
                                <div className="w-px flex-1 bg-border mt-1" />
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-foreground">
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