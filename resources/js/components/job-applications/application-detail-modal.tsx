import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import {
    ExternalLinkIcon,
    CalendarIcon,
    CalendarClockIcon,
    MapPinIcon,
    PhilippinePesoIcon,
    SparklesIcon,
    LoaderIcon,
    CheckIcon,
    XIcon,
    ClockIcon,
    MailIcon,
    CopyIcon,
    BookmarkIcon,
    UsersIcon,
    LinkIcon,
    UnlinkIcon,
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
import { ActivityTimeline } from '@/components/job-applications/activity-timeline';
import TaxBreakdownCard from '@/components/job-applications/tax-breakdown-card';
import SaveAsTemplateDialog from '@/components/application-templates/save-as-template-dialog';
import { JOB_APPLICATION_STATUSES, STATUS_COLORS } from '@/types/job-application';
import type { JobApplication } from '@/types/job-application';
import type { Contact } from '@/types/contact';
import { status as updateStatus, aiMatch, aiSalary } from '@/routes/job-applications';
import { link as linkContactRoute, unlink as unlinkContactRoute } from '@/routes/contacts';

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
    availableContacts = [],
}: {
    open: boolean;
    onClose: () => void;
    application: JobApplication | null;
    availableContacts?: Contact[];
}) {
    const [updating, setUpdating] = useState(false);
    const [resumeText, setResumeText] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState<string | null>(null);
    const [salaryChecking, setSalaryChecking] = useState(false);
    const [salaryError, setSalaryError] = useState<string | null>(null);
    const [followUpDraft, setFollowUpDraft] = useState<string | null>(null);
    const [followUpLoading, setFollowUpLoading] = useState(false);
    const [followUpError, setFollowUpError] = useState<string | null>(null);
    const [contacting, setContacting] = useState(false);
    const [prepGenerating, setPrepGenerating] = useState(false);
    const [prepError, setPrepError] = useState<string | null>(null);
    const [notesSaving, setNotesSaving] = useState(false);
    const [notesError, setNotesError] = useState<string | null>(null);
    const [localApplication, setLocalApplication] = useState<JobApplication | null>(null);
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

    useEffect(() => {
        if (application) {
            setLocalApplication(application);
            setResumeText('');
            setAnalyzeError(null);
            setSalaryError(null);
            setFollowUpDraft(null);
            setFollowUpError(null);
            setPrepError(null);
            setNotesError(null);
        }
    }, [application]);

    const handleFetchFollowUpDraft = useCallback(async () => {
        const app = localApplication ?? application;
        if (!app) return;

        setFollowUpLoading(true);
        setFollowUpError(null);

        try {
            const response = await fetch(
                `/job-applications/${app.id}/follow-up-draft`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                    },
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to generate follow-up draft.');
            }

            const result = await response.json();
            setFollowUpDraft(result.draft);
        } catch (error) {
            setFollowUpError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setFollowUpLoading(false);
        }
    }, [localApplication, application]);

    const handleMarkAsContacted = useCallback(async () => {
        const app = localApplication ?? application;
        if (!app) return;

        setContacting(true);

        try {
            const response = await fetch(
                `/job-applications/${app.id}/mark-as-contacted`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Failed to mark as contacted.');
            }

            const result = await response.json();
            setLocalApplication(result.data);
        } catch (error) {
            setFollowUpError(
                error instanceof Error ? error.message : 'An unexpected error occurred',
            );
        } finally {
            setContacting(false);
        }
    }, [localApplication, application]);

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

    const handleSalaryCheck = useCallback(async () => {
        const app = localApplication ?? application;
        if (!app) return;

        setSalaryChecking(true);
        setSalaryError(null);

        try {
            const response = await fetch(aiSalary.url(app.id), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Salary check failed. Please try again.');
            }

            const result = await response.json();

            setLocalApplication((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    ai_salary_min: result.salary_min,
                    ai_salary_max: result.salary_max,
                    ai_salary_notes: result.salary_notes,
                    ai_evaluated_at: result.evaluated_at,
                };
            });
        } catch (error) {
            setSalaryError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setSalaryChecking(false);
        }
    }, [localApplication, application]);

    const handleGenerateInterviewPrep = useCallback(async () => {
        const app = localApplication ?? application;
        if (!app) return;

        setPrepGenerating(true);
        setPrepError(null);

        try {
            const response = await fetch(
                `/job-applications/${app.id}/interview-prep`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                    },
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to generate interview prep.');
            }

            const result = await response.json();

            setLocalApplication((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    ai_interview_prep: {
                        questions: result.questions,
                        talking_points: result.talking_points,
                        tips: result.tips,
                    },
                };
            });
        } catch (error) {
            setPrepError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setPrepGenerating(false);
        }
    }, [localApplication, application]);

    const handleSaveInterviewNotes = useCallback(async () => {
        const app = localApplication ?? application;
        if (!app) return;

        setNotesSaving(true);
        setNotesError(null);

        try {
            const response = await fetch(
                `/job-applications/${app.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                    },
                    body: JSON.stringify({
                        interview_notes: app.interview_notes ?? '',
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to save interview notes.');
            }
        } catch (error) {
            setNotesError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setNotesSaving(false);
        }
    }, [localApplication, application]);

    if (!application) return null;

    const app = localApplication ?? application;

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                            className={`shrink-0 border-0 capitalize ${STATUS_COLORS[app.status]}`}
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

                        {app.interview_date && (
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">
                                    Interview Date
                                </span>
                                <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                                    <CalendarClockIcon className="size-3.5 text-muted-foreground" />
                                    {formatDate(app.interview_date)}
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

                    {app.tax_breakdown && (
                        <TaxBreakdownCard taxBreakdown={app.tax_breakdown} />
                    )}

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

                    {app.ai_salary_min !== null && app.ai_salary_max !== null && (
                        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <PhilippinePesoIcon className="size-3.5" />
                                AI Salary Estimate
                            </span>
                            <span className="text-lg font-semibold text-foreground">
                                {formatSalary(app.ai_salary_min)} – {formatSalary(app.ai_salary_max)} / mo
                            </span>
                            {app.ai_salary_notes && (
                                <p className="text-xs text-muted-foreground">
                                    {app.ai_salary_notes}
                                </p>
                            )}
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

                    <div className="flex flex-col gap-3 border-t border-border pt-4">
                        <span className="text-xs text-muted-foreground">
                            Salary Reality Check (₱)
                        </span>
                        {salaryError && (
                            <p className="text-xs text-destructive">{salaryError}</p>
                        )}
                        <Button
                            onClick={handleSalaryCheck}
                            disabled={salaryChecking}
                            variant="outline"
                        >
                            {salaryChecking ? (
                                <>
                                    <LoaderIcon className="size-4 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <PhilippinePesoIcon className="size-4" />
                                    Salary Reality Check (₱)
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border pt-4">
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

                    <div className="flex flex-col gap-3 border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                Last Contacted
                            </span>
                            <Button
                                onClick={handleMarkAsContacted}
                                disabled={contacting}
                                variant="outline"
                                size="sm"
                            >
                                {contacting ? (
                                    <>
                                        <LoaderIcon className="size-3 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <ClockIcon className="size-3" />
                                        Mark as Contacted
                                    </>
                                )}
                            </Button>
                        </div>
                        {app.last_contacted_at && (
                            <span className="text-xs text-muted-foreground">
                                Last contacted:{' '}
                                {new Date(app.last_contacted_at).toLocaleDateString('en-PH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                Follow-Up Draft
                            </span>
                            <Button
                                onClick={handleFetchFollowUpDraft}
                                disabled={followUpLoading}
                                variant="outline"
                                size="sm"
                            >
                                {followUpLoading ? (
                                    <>
                                        <LoaderIcon className="size-3 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <MailIcon className="size-3" />
                                        Generate Draft
                                    </>
                                )}
                            </Button>
                        </div>
                        {followUpError && (
                            <p className="text-xs text-destructive">{followUpError}</p>
                        )}
                        {followUpDraft && (
                            <div className="flex flex-col gap-1">
                                <textarea
                                    value={followUpDraft}
                                    readOnly
                                    rows={6}
                                    className="w-full resize-none rounded-lg border border-input bg-transparent p-2 text-sm outline-none"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(followUpDraft);
                                    }}
                                    className="self-end"
                                >
                                    <CopyIcon className="size-3" />
                                    Copy to Clipboard
                                </Button>
                            </div>
                        )}
                    </div>

                     <div className="flex flex-col gap-3 border-t border-border pt-4">
                         <span className="text-xs text-muted-foreground">
                             Interview Notes
                         </span>
                         <textarea
                             value={app.interview_notes ?? ''}
                             onChange={(e) => {
                                 setLocalApplication((prev) => {
                                     if (!prev) return prev;
                                     return { ...prev, interview_notes: e.target.value };
                                 });
                             }}
                             placeholder="Record interviewer names, questions asked, observations..."
                             rows={4}
                             className="w-full resize-none rounded-lg border border-input bg-transparent p-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                         />
                         {notesError && (
                             <p className="text-xs text-destructive">{notesError}</p>
                         )}
                         <Button
                             onClick={handleSaveInterviewNotes}
                             disabled={notesSaving}
                             size="sm"
                         >
                             {notesSaving ? (
                                 <>
                                     <LoaderIcon className="size-3 animate-spin" />
                                     Saving...
                                 </>
                             ) : (
                                 'Save Notes'
                             )}
                         </Button>
                     </div>

                     <div className="flex flex-col gap-3 border-t border-border pt-4">
                         <div className="flex items-center justify-between">
                             <span className="text-xs text-muted-foreground">
                                 Interview Prep
                             </span>
                             <Button
                                 onClick={handleGenerateInterviewPrep}
                                 disabled={prepGenerating}
                                 variant="outline"
                                 size="sm"
                             >
                                 {prepGenerating ? (
                                     <>
                                         <LoaderIcon className="size-3 animate-spin" />
                                         Generating...
                                     </>
                                 ) : (
                                     <>
                                         <SparklesIcon className="size-3" />
                                         Generate Interview Prep
                                     </>
                                 )}
                             </Button>
                         </div>
                         {prepError && (
                             <p className="text-xs text-destructive">{prepError}</p>
                         )}
                         {app.ai_interview_prep && (
                             <div className="flex flex-col gap-3">
                                 {app.ai_interview_prep.questions && app.ai_interview_prep.questions.length > 0 && (
                                     <div className="flex flex-col gap-1">
                                         <span className="text-xs font-medium text-foreground">
                                           Questions
                                         </span>
                                         <ul className="list-disc list-inside text-xs text-muted-foreground">
                                             {app.ai_interview_prep.questions.map((q, i) => (
                                                 <li key={i}>{q}</li>
                                             ))}
                                         </ul>
                                     </div>
                                 )}
                                 {app.ai_interview_prep.talking_points && app.ai_interview_prep.talking_points.length > 0 && (
                                     <div className="flex flex-col gap-1">
                                         <span className="text-xs font-medium text-foreground">
                                           Talking Points
                                         </span>
                                         <ul className="list-disc list-inside text-xs text-muted-foreground">
                                             {app.ai_interview_prep.talking_points.map((tp, i) => (
                                                 <li key={i}>{tp}</li>
                                             ))}
                                         </ul>
                                     </div>
                                 )}
                                 {app.ai_interview_prep.tips && app.ai_interview_prep.tips.length > 0 && (
                                     <div className="flex flex-col gap-1">
                                         <span className="text-xs font-medium text-foreground">
                                           Tips
                                         </span>
                                         <ul className="list-disc list-inside text-xs text-muted-foreground">
                                             {app.ai_interview_prep.tips.map((t, i) => (
                                                 <li key={i}>{t}</li>
                                             ))}
                                         </ul>
                                     </div>
                                 )}
                             </div>
                         )}
                     </div>

                     <div className="flex flex-col gap-3 border-t border-border pt-4">
                         <div className="flex items-center justify-between">
                             <span className="text-xs text-muted-foreground">
                                 Contacts
                             </span>
                         </div>
                         {app.contacts && app.contacts.length > 0 ? (
                             <div className="flex flex-wrap gap-1">
                                 {app.contacts.map((contact: { id: number; name: string; email?: string | null; role?: string | null; company_name?: string | null }) => (
                                     <Badge
                                         key={contact.id}
                                         variant="secondary"
                                         className="gap-1 text-xs"
                                     >
                                         <UsersIcon className="size-2.5" />
                                         {contact.name}
                                         {contact.role && (
                                             <span className="text-muted-foreground">
                                                 ({contact.role})
                                             </span>
                                         )}
                                     </Badge>
                                 ))}
                             </div>
                         ) : (
                             <p className="text-xs text-muted-foreground italic">
                                 No contacts linked
                             </p>
                         )}
                         {availableContacts.length > 0 && (
                             <div className="flex flex-col gap-1">
                                 <span className="text-[11px] text-muted-foreground">
                                     Link a contact:
                                 </span>
                                 <div className="flex flex-wrap gap-1">
                                     {availableContacts
                                         .filter(
                                             (c) =>
                                                 !app.contacts?.some(
                                                     (ec: { id: number }) => ec.id === c.id,
                                                 ),
                                         )
                                         .map((contact) => (
                                             <Button
                                                 key={contact.id}
                                                 variant="outline"
                                                 size="sm"
                                                 className="h-6 px-2 text-xs"
                                                 onClick={() => {
                                                     router.post(
                                                         linkContactRoute.url(contact.id),
                                                         {
                                                             job_application_id: app.id,
                                                         },
                                                         { preserveState: true },
                                                     );
                                                 }}
                                             >
                                                 <LinkIcon className="size-2.5" />
                                                 {contact.name}
                                             </Button>
                                         ))}
                                 </div>
                             </div>
                         )}
                     </div>
                 {app.activities && app.activities.length > 0 && (
                        <ActivityTimeline activities={app.activities} />
                    )}
                </div>

                <div className="-mx-4 -mb-4 mt-2 flex justify-between rounded-b-xl border-t bg-muted/50 p-4">
                    <Button variant="ghost" size="sm" onClick={() => setTemplateDialogOpen(true)}>
                        <BookmarkIcon className="size-3.5" />
                        Save as Template
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>

                <SaveAsTemplateDialog
                    open={templateDialogOpen}
                    onClose={() => setTemplateDialogOpen(false)}
                    application={app}
                />
            </DialogContent>
        </Dialog>
    );
}