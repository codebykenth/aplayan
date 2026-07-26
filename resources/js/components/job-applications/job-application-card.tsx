import { Badge } from '@/components/ui/badge';
import type { JobApplication } from '@/types/job-application';
import { STATUS_COLORS } from '@/types/job-application';

function formatSalary(amount: number | null): string | null {
    if (amount === null) return null;

    return `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
}

function formatDate(date: string | null): string | null {
    if (!date) return null;

    const d = new Date(date);

    return d.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function JobApplicationCard({
    application,
    onView,
    onEdit,
    onDelete,
}: {
    application: JobApplication;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onView}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onView();
                }
            }}
            className="flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-primary/30 hover:bg-accent/30"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="truncate text-sm font-semibold text-card-foreground">
                        {application.job_title}
                    </h3>
                    <p className="truncate text-sm text-muted-foreground">
                        {application.company_name}
                    </p>
                    {application.location && (
                        <p className="truncate text-xs text-muted-foreground">
                            {application.location}
                        </p>
                    )}
                </div>
                <Badge
                    className={`shrink-0 border-0 ${STATUS_COLORS[application.status]}`}
                >
                    {application.status}
                </Badge>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {application.expected_salary !== null && (
                    <span>
                        Expected: {formatSalary(application.expected_salary)}
                    </span>
                )}
                {application.offered_salary !== null && (
                    <span>
                        Offered: {formatSalary(application.offered_salary)}
                    </span>
                )}
                {application.date_applied && (
                    <span>Applied: {formatDate(application.date_applied)}</span>
                )}
            </div>

            {application.job_description && (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                    {application.job_description}
                </p>
            )}

            {application.ai_match_percentage !== null && (
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">AI Match:</span>
                    <span
                        className={`font-medium ${
                            application.ai_match_percentage >= 70
                                ? 'text-green-600 dark:text-green-400'
                                : application.ai_match_percentage >= 40
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-red-600 dark:text-red-400'
                        }`}
                    >
                        {application.ai_match_percentage}%
                    </span>
                </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                    Edit
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="rounded-md px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}