import {
    GripVerticalIcon,
    MoreVerticalIcon,
    PencilIcon,
    TrashIcon,
    CalendarClockIcon,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import type { JobApplication } from '@/types/job-application';

function formatSalary(amount: number | null): string | null {
    if (amount === null) {
return null;
}

    return `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
}

function formatDate(date: string | null): string | null {
    if (!date) {
return null;
}

    const d = new Date(date);

    return d.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function InterviewCountdownBadge({
    interviewDate,
}: {
    interviewDate: string;
}) {
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

    useEffect(() => {
        const now = new Date();
        const target = new Date(interviewDate);
        const diffMs = target.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        setDaysRemaining(diffDays);
    }, [interviewDate]);

    if (daysRemaining === null || daysRemaining < 0) {
return null;
}

    const label = daysRemaining === 0
        ? 'Interview today'
        : daysRemaining === 1
          ? 'Interview in 1 day'
          : `Interview in ${daysRemaining} days`;

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <CalendarClockIcon className="size-3" />
            {label}
        </span>
    );
}

function StalenessBadge({
    level,
    daysSinceUpdate,
}: {
    level: 'warning' | 'alert' | null;
    daysSinceUpdate: number;
}) {
    if (level === null) {
return null;
}

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                level === 'alert'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            }`}
        >
            {level === 'alert' ? 'Needs attention' : 'Follow up'} {daysSinceUpdate}d
        </span>
    );
}

function ActionsDropdown({
    onEdit,
    onDelete,
}: {
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
return;
}

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        setOpen((prev) => !prev);
                    }
                }}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover/card:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Actions"
            >
                <MoreVerticalIcon className="size-4" />
            </button>

            {open && (
                <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                            onEdit();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-accent"
                    >
                        <PencilIcon className="size-3.5" />
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                            onDelete();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                    >
                        <TrashIcon className="size-3.5" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

export default function JobApplicationCard({
    application,
    onView,
    onEdit,
    onDelete,
    dragHandleProps,
}: {
    application: JobApplication;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    dragHandleProps?: Record<string, unknown>;
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
            className="group/card flex cursor-pointer flex-col gap-2 rounded-xl border border-border/50 bg-card/70 p-3 shadow-xs backdrop-blur-md transition-all hover:border-primary/30 hover:bg-card/90 hover:shadow-sm"
        >
            <div className="flex items-start gap-2">
                <button
                    type="button"
                    {...dragHandleProps}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md p-0.5 text-muted-foreground/50 transition-colors hover:text-muted-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Drag to reorder"
                >
                    <GripVerticalIcon className="size-4" />
                </button>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <h3 className="truncate text-sm font-semibold text-card-foreground">
                        {application.job_title}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">
                        {application.company_name}
                        {application.location && (
                            <> {'\u00B7'} {application.location}</>
                        )}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                    <StatusBadge status={application.status} className="text-[10px] px-2 py-0 leading-normal" />

                    <ActionsDropdown onEdit={onEdit} onDelete={onDelete} />
                </div>
            </div>

            {(application.status === 'interviewing' && application.interview_date || application.staleness_level !== null) && (
                <div className="flex flex-wrap items-center gap-1.5">
                    {application.status === 'interviewing' && application.interview_date && (
                        <InterviewCountdownBadge interviewDate={application.interview_date} />
                    )}

                    <StalenessBadge
                        level={application.staleness_level}
                        daysSinceUpdate={application.days_since_update}
                    />
                </div>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                {application.date_applied && (
                    <span>{formatDate(application.date_applied)}</span>
                )}
                {application.expected_salary !== null && (
                    <span>Expected {formatSalary(application.expected_salary)}</span>
                )}
                {application.ai_match_percentage !== null && (
                    <span
                        className={`font-medium ${
                            application.ai_match_percentage >= 70
                                ? 'text-green-600 dark:text-green-400'
                                : application.ai_match_percentage >= 40
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-red-600 dark:text-red-400'
                        }`}
                    >
                        {application.ai_match_percentage}% match
                    </span>
                )}
            </div>
        </div>
    );
}