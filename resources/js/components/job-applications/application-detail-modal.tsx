import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import {
    ExternalLinkIcon,
    CalendarIcon,
    MapPinIcon,
    PhilippinePesoIcon,
    SparklesIcon,
    LoaderIcon,
    CheckIcon,
    XIcon,
} from 'lucide-react';
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
import { status as updateStatus, aiMatch } from '@/routes/job-applications';

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
    const [resumeText, setResumeText] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState<string | null>(null);
    const [localApplication, setLocalApplication] = useState<JobApplication | null>(null);

    useEffect(() => {
        if (application) {
            setLocalApplication(application);
            setResumeText('');
            setAnalyzeError(null);
        }
    }, [application]);

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

    const handleAnalyzeMatch = useCallback(async () => {
        const app = localApplication ?? application;
        if (!app || !resumeText.trim()) return;

        setAnalyzing(true);
        setAnalyzeError(null);

        try {
            const response = await fetch(aiMatch.url(app.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ resume_text: resumeText }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Analysis failed. Please try again.');
            }

            const result = await response.json();

            setLocalApplication((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    ai_match_percentage: result.match_percentage,
                    ai_strengths: result.strengths,
                    ai_gaps: result.gaps,
                    ai_evaluated_at: result.evaluated_at,
                };
            });
        } catch (error) {
            setAnalyzeError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setAnalyzing(false);
        }
    }, [localApplication, application, resumeText]);

    if (!application) return null;

    const app = localApplication ?? application;

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        {app.job_title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-foreground">
                                {app.company_name}
                            </p>
                            {app.location && (
                                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPinIcon className="size-3.5" />
                                    {app.location}
                                </p>
                            )}
                        </div>
                        <Badge
                            className={`shrink-0 border-0 ${STATUS_COLORS[app.status]}`}
                        >
                            {JOB_APPLICATION_STATUSES.find(
                                (s) => s.value === app.status,
                            )?.label ?? app.status}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {app.date_applied && (
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">
                                    Date Applied
                                </span>
                                <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                                    <CalendarIcon className="size-3.5 text-muted-foreground" />
                                    {formatDate(app.date_applied)}
                                </span>
                            </div>
                        )}

                        {app.expected_salary !== null && (
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">
                                    Expected Salary
                                </span>
                                <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                                    <PhilippinePesoIcon className="size-3.5 text-muted-foreground" />
                                    {formatSalary(app.expected_salary)}
                                </span>
                            </div>
                        )}

                        {app.offered_salary !== null && (
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">
                                    Offered Salary
                                </span>
                                <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                                    <PhilippinePesoIcon className="size-3.5 text-muted-foreground" />
                                    {formatSalary(app.offered_salary)}
                                </span>
                            </div>
                        )}
                    </div>

                    {app.job_url && (
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                                Job URL
                            </span>
                            <a
                                href={app.job_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-2 hover:text-primary/80"
                            >
                                {app.job_url}
                                <ExternalLinkIcon className="size-3.5 shrink-0" />
                            </a>
                        </div>
                    )}

                    {app.job_description && (
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                                Job Description
                            </span>
                            <p className="whitespace-pre-wrap text-sm text-foreground">
                                {app.job_description}
                            </p>
                        </div>
                    )}

                    {app.notes && (
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                                Notes
                            </span>
                            <p className="whitespace-pre-wrap text-sm text-foreground">
                                {app.notes}
                            </p>
                        </div>
                    )}

                    {app.ai_match_percentage !== null && (
                        <div className="flex flex-col gap-2">
                            <span className="text-xs text-muted-foreground">
                                Resume Match Score
                            </span>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                        app.ai_match_percentage >= 70
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                            : app.ai_match_percentage >= 40
                                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    }`}
                                >
                                    {app.ai_match_percentage}%
                                </span>
                                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                    {app.ai_strengths && app.ai_strengths.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {app.ai_strengths.map((s, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-[11px] text-green-700 dark:bg-green-900/20 dark:text-green-300"
                                                >
                                                    <CheckIcon className="size-3" />
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {app.ai_gaps && app.ai_gaps.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {app.ai_gaps.map((g, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-[11px] text-red-700 dark:bg-red-900/20 dark:text-red-300"
                                                >
                                                    <XIcon className="size-3" />
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 border-t border-border pt-4">
                        <span className="text-xs text-muted-foreground">
                            Run AI Resume Match
                        </span>
                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your resume text here..."
                            rows={4}
                            className="w-full resize-none rounded-lg border border-input bg-transparent p-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                            <input
                                type="file"
                                accept=".txt,.pdf"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const text = await file.text();
                                    setResumeText(text);
                                }}
                            />
                            <span className="rounded-md border border-input px-3 py-1.5 text-xs">
                                Upload file
                            </span>
                            (.txt or .pdf, text will be extracted)
                        </label>
                        {analyzeError && (
                            <p className="text-xs text-destructive">{analyzeError}</p>
                        )}
                        <Button
                            onClick={handleAnalyzeMatch}
                            disabled={analyzing || !resumeText.trim()}
                        >
                            {analyzing ? (
                                <>
                                    <LoaderIcon className="size-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="size-4" />
                                    Run AI Match
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-muted-foreground">
                            Status
                        </span>
                        <Select
                            value={app.status}
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