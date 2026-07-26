import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { ExternalLinkIcon, CalendarIcon, MapPinIcon, PhilippinePesoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { JOB_APPLICATION_STATUSES, STATUS_COLORS } from '@/types/job-application';
import type { JobApplication } from '@/types/job-application';
import { status as updateStatus } from '@/routes/job-applications';

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

export default function ApplicationDetailModal({
    open,
    onClose,
    application,
}: {
    open: boolean;
    onClose: () => void;
    application: JobApplication | null;
}) {
    const [updating, setUpdating] = useState(false);

    const handleStatusChange = useCallback(
        (newStatus: string | null) => {
            if (!application || !newStatus || newStatus === application.status) return;

            setUpdating(true);

            router.patch(
                updateStatus.url(application.id),
                { status: newStatus },
                {
                    preserveState: true,
                    onFinish: () => setUpdating(false),
                },
            );
        },
        [application],
    );

    if (!application) return null;

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        {application.job_title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-foreground">
                                {application.company_name}
                            </p>
                            {application.location && (
                                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPinIcon className="size-3.5" />
                                    {application.location}
                                </p>
                            )}
                        </div>
                        <Badge
                            className={`shrink-0 border-0 ${STATUS_COLORS[application.status]}`}
                        >
                            {JOB_APPLICATION_STATUSES.find(
                                (s) => s.value === application.status,
                            )?.label ?? application.status}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {application.date_applied && (
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">
                                    Date Applied
                                </span>
                                <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                                    <CalendarIcon className="size-3.5 text-muted-foreground" />
                                    {formatDate(application.date_applied)}
                                </span>
                            </div>
                        )}

                        {application.expected_salary !== null && (
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">
                                    Expected Salary
                                </span>
                                <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                                    <PhilippinePesoIcon className="size-3.5 text-muted-foreground" />
                                    {formatSalary(application.expected_salary)}
                                </span>
                            </div>
                        )}

                        {application.offered_salary !== null && (
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">
                                    Offered Salary
                                </span>
                                <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                                    <PhilippinePesoIcon className="size-3.5 text-muted-foreground" />
                                    {formatSalary(application.offered_salary)}
                                </span>
                            </div>
                        )}
                    </div>

                    {application.job_url && (
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                                Job URL
                            </span>
                            <a
                                href={application.job_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-2 hover:text-primary/80"
                            >
                                {application.job_url}
                                <ExternalLinkIcon className="size-3.5 shrink-0" />
                            </a>
                        </div>
                    )}

                    {application.job_description && (
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                                Job Description
                            </span>
                            <p className="whitespace-pre-wrap text-sm text-foreground">
                                {application.job_description}
                            </p>
                        </div>
                    )}

                    {application.notes && (
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                                Notes
                            </span>
                            <p className="whitespace-pre-wrap text-sm text-foreground">
                                {application.notes}
                            </p>
                        </div>
                    )}

                    {application.ai_match_percentage !== null && (
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                                AI Match
                            </span>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-sm font-medium ${
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
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5 border-t border-border pt-4">
                        <span className="text-xs text-muted-foreground">
                            Status
                        </span>
                        <Select
                            value={application.status}
                            onValueChange={handleStatusChange}
                            disabled={updating}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {JOB_APPLICATION_STATUSES.map((status) => (
                                    <SelectItem
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="-mx-4 -mb-4 mt-2 flex justify-end rounded-b-xl border-t bg-muted/50 p-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}