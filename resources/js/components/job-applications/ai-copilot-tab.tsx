import { router, usePage } from '@inertiajs/react';
import {
    SparklesIcon,
    PhilippinePesoIcon,
    LoaderIcon,
    MailIcon,
    CopyIcon,
    CheckIcon,
    XIcon,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { JobApplication } from '@/types/job-application';

interface AiCopilotTabProps {
    application: JobApplication;
    onResumeMatch?: (resumeText: string) => void;
    onSalaryCheck?: () => void;
    onInterviewPrep?: () => void;
    onFollowUpDraft?: () => void;
}

function formatSalary(amount: number | null): string | null {
    if (amount === null) {
return null;
}

    return `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
}

export default function AiCopilotTab({
    application,
}: AiCopilotTabProps) {
    const { aiLimit } = usePage<{ aiLimit?: { remaining: number; total: number; exhausted: boolean } }>().props;
    const [resumeText, setResumeText] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState<string | null>(null);
    const [salaryChecking, setSalaryChecking] = useState(false);
    const [salaryError, setSalaryError] = useState<string | null>(null);
    const [prepGenerating, setPrepGenerating] = useState(false);
    const [prepError, setPrepError] = useState<string | null>(null);
    const [followUpDraft, setFollowUpDraft] = useState<string | null>(null);
    const [followUpLoading, setFollowUpLoading] = useState(false);
    const [followUpError, setFollowUpError] = useState<string | null>(null);

    const handleAnalyzeMatch = useCallback(async () => {
        if (!resumeText.trim()) {
return;
}

        setAnalyzing(true);
        setAnalyzeError(null);

        try {
            const response = await fetch(`/job-applications/${application.id}/ai-match`, {
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
            router.reload();
        } catch (error) {
            setAnalyzeError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setAnalyzing(false);
        }
    }, [application.id, resumeText]);

    const handleSalaryCheck = useCallback(async () => {
        setSalaryChecking(true);
        setSalaryError(null);

        try {
            const response = await fetch(`/job-applications/${application.id}/ai-salary`, {
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

            router.reload();
        } catch (error) {
            setSalaryError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setSalaryChecking(false);
        }
    }, [application.id]);

    const handleGenerateInterviewPrep = useCallback(async () => {
        setPrepGenerating(true);
        setPrepError(null);

        try {
            const response = await fetch(`/job-applications/${application.id}/interview-prep`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                throw new Error(errorData.message || 'Failed to generate interview prep.');
            }

            router.reload();
        } catch (error) {
            setPrepError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setPrepGenerating(false);
        }
    }, [application.id]);

    const handleFetchFollowUpDraft = useCallback(async () => {
        setFollowUpLoading(true);
        setFollowUpError(null);

        try {
            const response = await fetch(`/job-applications/${application.id}/follow-up-draft`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
            });

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
    }, [application.id]);

    return (
        <div className="flex flex-col gap-5">
            {aiLimit && (
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <SparklesIcon className="size-3.5 text-amber-500" />
                        Daily AI Quota: <span className="font-bold">{aiLimit.remaining}/{aiLimit.total} remaining</span>
                    </span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <span className="cursor-help text-[11px] text-muted-foreground underline decoration-dotted">
                                        Shared quota info
                                    </span>
                                }
                            />
                            <TooltipContent side="bottom" className="max-w-xs text-xs">
                                10 uncached requests/day shared across AI Assist & Document Generator. Repeat queries hit the cache instantly for free.
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}

            <div className="flex flex-col gap-3">
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

                            if (!file) {
return;
}

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

            {application.ai_match_percentage !== null && (
                <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground">
                        Resume Match Score
                    </span>
                    <div className="flex items-center gap-3">
                        <span
                            className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                application.ai_match_percentage >= 70
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    : application.ai_match_percentage >= 40
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                        >
                            {application.ai_match_percentage}%
                        </span>
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                            {application.ai_strengths && application.ai_strengths.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {application.ai_strengths.map((s, i) => (
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
                            {application.ai_gaps && application.ai_gaps.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {application.ai_gaps.map((g, i) => (
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

            {application.ai_salary_min !== null && application.ai_salary_max !== null && (
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <PhilippinePesoIcon className="size-3.5" />
                        AI Salary Estimate
                    </span>
                    <span className="text-lg font-semibold text-foreground">
                        {formatSalary(application.ai_salary_min)} – {formatSalary(application.ai_salary_max)} / mo
                    </span>
                    {application.ai_salary_notes && (
                        <p className="text-xs text-muted-foreground">
                            {application.ai_salary_notes}
                        </p>
                    )}
                </div>
            )}

            {application.status === 'interviewing' && (
                <div className="flex flex-col gap-3 border-t border-border pt-4">
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
                    {prepError && (
                        <p className="text-xs text-destructive">{prepError}</p>
                    )}
                    {application.ai_interview_prep && (
                        <div className="flex flex-col gap-3">
                            {application.ai_interview_prep.questions && application.ai_interview_prep.questions.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-foreground">
                                        Questions
                                    </span>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground">
                                        {application.ai_interview_prep.questions.map((q, i) => (
                                            <li key={i}>{q}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {application.ai_interview_prep.talking_points && application.ai_interview_prep.talking_points.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-foreground">
                                        Talking Points
                                    </span>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground">
                                        {application.ai_interview_prep.talking_points.map((tp, i) => (
                                            <li key={i}>{tp}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {application.ai_interview_prep.tips && application.ai_interview_prep.tips.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-foreground">
                                        Tips
                                    </span>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground">
                                        {application.ai_interview_prep.tips.map((t, i) => (
                                            <li key={i}>{t}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {(application.status === 'applied' || application.status === 'interviewing') && application.staleness_level !== null && (
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
            )}
        </div>
    );
}
