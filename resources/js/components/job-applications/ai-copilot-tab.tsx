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
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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

function formatResumeToText(profile: any): string {
    if (!profile) {
        return '';
    }

    const fullName = profile.full_name || '';
    const targetRole = profile.target_role || '';
    const summary = profile.summary || '';

    const lines: string[] = [];

    if (fullName) {
        lines.push(fullName + (targetRole ? ` — ${targetRole}` : ''));
    }

    if (summary) {
        lines.push(`\nSUMMARY:\n${summary.trim()}`);
    }

    if (
        Array.isArray(profile.work_experience) &&
        profile.work_experience.length > 0
    ) {
        lines.push('\nWORK EXPERIENCE:');
        profile.work_experience.forEach((job: any) => {
            const title = job.position || job.title || 'Role';
            const company = job.company || 'Company';
            const dateStr =
                job.duration ||
                job.year ||
                (job.start_date
                    ? `${job.start_date} - ${job.end_date || 'Present'}`
                    : 'N/A');
            lines.push(`• ${title} at ${company} (${dateStr})`);

            if (job.description) {
                const descLines = String(job.description)
                    .split('\n')
                    .map((l: string) => l.trim())
                    .filter(Boolean);
                descLines.forEach((descLine: string) => {
                    const formatted = /^[-*•]\s*/.test(descLine)
                        ? `  ${descLine.replace(/^[-*•]\s*/, '• ')}`
                        : `  • ${descLine}`;
                    lines.push(formatted);
                });
            }
        });
    }

    if (Array.isArray(profile.education) && profile.education.length > 0) {
        lines.push('\nEDUCATION:');
        profile.education.forEach((edu: any) => {
            const degree = edu.degree || 'Degree';
            const inst = edu.institution || 'Institution';
            const dateStr = edu.year || edu.duration || 'N/A';
            lines.push(`• ${degree} — ${inst} (${dateStr})`);
        });
    }

    if (Array.isArray(profile.skills) && profile.skills.length > 0) {
        const skillList = profile.skills.filter(Boolean).join(', ');

        if (skillList) {
            lines.push(`\nSKILLS:\n${skillList}`);
        }
    }

    if (Array.isArray(profile.projects) && profile.projects.length > 0) {
        lines.push('\nPROJECTS:');
        profile.projects.forEach((proj: any) => {
            lines.push(
                `• ${proj.title || 'Project'}: ${proj.description || ''}`,
            );
        });
    }

    if (
        Array.isArray(profile.certifications) &&
        profile.certifications.length > 0
    ) {
        const certList = profile.certifications.filter(Boolean).join(', ');

        if (certList) {
            lines.push(`\nCERTIFICATIONS:\n${certList}`);
        }
    }

    return lines.join('\n');
}

export default function AiCopilotTab({ application }: AiCopilotTabProps) {
    const { aiLimit, resumeProfile, savedResumes } = usePage<{
        aiLimit?: { remaining: number; total: number; exhausted: boolean };
        resumeProfile?: any;
        savedResumes?: any[];
    }>().props;

    const [resumeText, setResumeText] = useState('');
    const [selectedResumeId, setSelectedResumeId] = useState<string>('master');

    useEffect(() => {
        if (application.ai_resume_text) {
            setResumeText(application.ai_resume_text);
            setSelectedResumeId('custom');
        } else if (!resumeText && resumeProfile) {
            const formatted = formatResumeToText(resumeProfile);

            if (formatted) {
                setResumeText(formatted);
                setSelectedResumeId('master');
            }
        }
    }, [application.ai_resume_text, resumeProfile]);

    const hasSubScores =
        application.ai_tech_stack_percentage !== null ||
        application.ai_experience_percentage !== null ||
        application.ai_education_percentage !== null;
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState<string | null>(null);
    const [matchBadge, setMatchBadge] = useState<string | null>(null);
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
            const response = await fetch(
                `/job-applications/${application.id}/ai-match`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') ?? '',
                    },
                    body: JSON.stringify({
                        resume_text: resumeText,
                        force_refresh: true,
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                throw new Error(
                    errorData.message || 'Analysis failed. Please try again.',
                );
            }

            const result = await response.json();

            if (result._error) {
                setAnalyzeError(`AI Service Notice: ${result._error}`);
            } else {
                setAnalyzeError(null);
            }

            if (result._badge) {
                setMatchBadge(result._badge);
            } else {
                setMatchBadge(null);
            }

            router.reload();
        } catch (error) {
            setAnalyzeError(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred',
            );
        } finally {
            setAnalyzing(false);
        }
    }, [application.id, resumeText]);

    const handleSalaryCheck = useCallback(async () => {
        setSalaryChecking(true);
        setSalaryError(null);

        try {
            const response = await fetch(
                `/job-applications/${application.id}/ai-salary`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') ?? '',
                    },
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                throw new Error(
                    errorData.message ||
                        'Salary check failed. Please try again.',
                );
            }

            router.reload();
        } catch (error) {
            setSalaryError(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred',
            );
        } finally {
            setSalaryChecking(false);
        }
    }, [application.id]);

    const handleGenerateInterviewPrep = useCallback(async () => {
        setPrepGenerating(true);
        setPrepError(null);

        try {
            const response = await fetch(
                `/job-applications/${application.id}/interview-prep`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') ?? '',
                    },
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                throw new Error(
                    errorData.message || 'Failed to generate interview prep.',
                );
            }

            router.reload();
        } catch (error) {
            setPrepError(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred',
            );
        } finally {
            setPrepGenerating(false);
        }
    }, [application.id]);

    const handleFetchFollowUpDraft = useCallback(async () => {
        setFollowUpLoading(true);
        setFollowUpError(null);

        try {
            const response = await fetch(
                `/job-applications/${application.id}/follow-up-draft`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') ?? '',
                    },
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                throw new Error(
                    errorData.message || 'Failed to generate follow-up draft.',
                );
            }

            const result = await response.json();
            setFollowUpDraft(result.draft);
        } catch (error) {
            setFollowUpError(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred',
            );
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
                        Daily AI Quota:{' '}
                        <span className="font-bold">
                            {aiLimit.remaining}/{aiLimit.total} remaining
                        </span>
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
                            <TooltipContent
                                side="bottom"
                                className="max-w-xs text-xs"
                            >
                                10 uncached requests/day shared across AI Assist
                                & Document Generator. Repeat queries hit the
                                cache instantly for free.
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}

            {!application.job_description?.trim() && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs font-medium text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-300">
                    💡 <strong>Missing Job Description</strong>: Please edit
                    this application to add a job description so the AI can
                    accurately match your resume against the role requirements.
                </div>
            )}

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                        Resume Content
                    </span>
                    {(resumeProfile ||
                        (savedResumes && savedResumes.length > 0)) && (
                        <Select
                            value={selectedResumeId}
                            onValueChange={(val) => {
                                if (!val) {
                                    return;
                                }

                                setSelectedResumeId(val);

                                if (val === 'master' && resumeProfile) {
                                    setResumeText(
                                        formatResumeToText(resumeProfile),
                                    );
                                } else {
                                    const selectedSaved = savedResumes?.find(
                                        (r: any) => String(r.id) === val,
                                    );

                                    if (selectedSaved?.profile_data) {
                                        setResumeText(
                                            formatResumeToText(
                                                selectedSaved.profile_data,
                                            ),
                                        );
                                    }
                                }
                            }}
                        >
                            <SelectTrigger className="h-8 w-[240px] text-xs">
                                <SelectValue placeholder="⚡ Load from profile/resume...">
                                    {selectedResumeId === 'master'
                                        ? '📌 Master Resume Profile'
                                        : selectedResumeId === 'custom'
                                          ? '✏️ Custom / Analyzed Resume Text'
                                          : savedResumes?.find(
                                                  (r: any) =>
                                                      String(r.id) ===
                                                      selectedResumeId,
                                              )
                                            ? `📄 ${savedResumes.find((r: any) => String(r.id) === selectedResumeId)?.name}`
                                            : null}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="custom">
                                    ✏️ Custom / Analyzed Resume Text
                                </SelectItem>
                                {resumeProfile && (
                                    <SelectItem value="master">
                                        📌 Master Resume Profile
                                    </SelectItem>
                                )}
                                {savedResumes?.map((r: any) => (
                                    <SelectItem key={r.id} value={String(r.id)}>
                                        📄 {r.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <textarea
                    value={resumeText}
                    onChange={(e) => {
                        setResumeText(e.target.value);
                        setSelectedResumeId('custom');
                    }}
                    placeholder="Paste your resume text here..."
                    rows={6}
                    className="min-h-[120px] w-full resize rounded-lg border border-input bg-transparent p-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-medium text-amber-900 dark:text-amber-200">
                        <div className="flex items-start gap-2">
                            <span className="shrink-0 text-sm">⚠️</span>
                            <div>
                                <p className="font-semibold">{analyzeError}</p>
                                {application.ai_strengths?.[0]?.startsWith(
                                    'Matching keyword:',
                                ) && (
                                    <p className="mt-1 text-[11px] opacity-80">
                                        Fallback keyword analysis was used. For
                                        details, view{' '}
                                        <code>storage/logs/laravel.log</code>.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {!resumeText.trim() && application.job_description?.trim() && (
                    <p className="text-[11px] text-muted-foreground">
                        ℹ️ Please paste or upload your resume text into the text
                        area above to enable AI Match.
                    </p>
                )}
                <Button
                    onClick={handleAnalyzeMatch}
                    disabled={
                        analyzing ||
                        !resumeText.trim() ||
                        !application.job_description?.trim()
                    }
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
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span
                                className={`inline-flex size-12 shrink-0 items-center justify-center rounded-xl text-base font-bold shadow-xs ${
                                    application.ai_match_percentage >= 70
                                        ? 'border border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300'
                                        : application.ai_match_percentage >= 40
                                          ? 'border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                          : 'border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300'
                                }`}
                            >
                                {application.ai_match_percentage}%
                            </span>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-foreground">
                                    Resume Match Score
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {application.ai_match_percentage >= 70
                                        ? 'Strong alignment with job requirements'
                                        : application.ai_match_percentage >= 40
                                          ? 'Moderate match — consider tailoring key skills'
                                          : 'Low match — several key requirements missing'}
                                </span>
                            </div>
                        </div>
                        {(matchBadge ||
                            application.ai_strengths?.[0]?.startsWith(
                                'Matching keyword:',
                            )) && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                                ⚡{' '}
                                {matchBadge ||
                                    'Smart Keyword Analysis (Fallback Mode)'}
                            </span>
                        )}
                    </div>

                    {hasSubScores && (
                        <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
                            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Category Breakdown
                            </span>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                {[
                                    {
                                        key: 'tech_stack',
                                        label: 'Tech Stack',
                                        value: application.ai_tech_stack_percentage,
                                    },
                                    {
                                        key: 'experience',
                                        label: 'Experience',
                                        value: application.ai_experience_percentage,
                                    },
                                    {
                                        key: 'education',
                                        label: 'Education',
                                        value: application.ai_education_percentage,
                                    },
                                ].map(
                                    ({ key, label, value }) =>
                                        value !== null && (
                                            <div
                                                key={key}
                                                className="flex flex-col gap-1"
                                            >
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-foreground">
                                                        {label}
                                                    </span>
                                                    <span
                                                        className={`font-bold tabular-nums ${
                                                            value >= 70
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : value >= 40
                                                                  ? 'text-amber-600 dark:text-amber-400'
                                                                  : 'text-red-600 dark:text-red-400'
                                                        }`}
                                                    >
                                                        {value}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            value >= 70
                                                                ? 'bg-green-500/70'
                                                                : value >= 40
                                                                  ? 'bg-amber-500/70'
                                                                  : 'bg-red-500/70'
                                                        }`}
                                                        style={{
                                                            width: `${value}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ),
                                )}
                            </div>
                        </div>
                    )}

                    {application.ai_strengths?.length ||
                    application.ai_gaps?.length ? (
                        <div className="grid grid-cols-1 gap-3 border-t border-border/60 pt-3 md:grid-cols-2">
                            {application.ai_strengths &&
                                application.ai_strengths.length > 0 && (
                                    <div className="flex flex-col gap-1.5">
                                        <span className="flex items-center gap-1 text-[11px] font-semibold text-green-700 dark:text-green-400">
                                            <CheckIcon className="size-3" /> Key
                                            Strengths (
                                            {application.ai_strengths.length})
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {application.ai_strengths.map(
                                                (s, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1 rounded-md border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs text-green-800 dark:text-green-300"
                                                    >
                                                        {s}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                            {application.ai_gaps &&
                                application.ai_gaps.length > 0 && (
                                    <div className="flex flex-col gap-1.5">
                                        <span className="flex items-center gap-1 text-[11px] font-semibold text-red-700 dark:text-red-400">
                                            <XIcon className="size-3" /> Missing
                                            / Skill Gaps (
                                            {application.ai_gaps.length})
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {application.ai_gaps.map((g, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs text-red-800 dark:text-red-300"
                                                >
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    ) : null}
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

            {application.ai_salary_min !== null &&
                application.ai_salary_max !== null && (
                    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <PhilippinePesoIcon className="size-3.5" />
                            AI Salary Estimate
                        </span>
                        <span className="text-lg font-semibold text-foreground">
                            {formatSalary(application.ai_salary_min)} –{' '}
                            {formatSalary(application.ai_salary_max)} / mo
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
                            {application.ai_interview_prep.questions &&
                                application.ai_interview_prep.questions.length >
                                    0 && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-foreground">
                                            Questions
                                        </span>
                                        <ul className="list-inside list-disc text-xs text-muted-foreground">
                                            {application.ai_interview_prep.questions.map(
                                                (q, i) => (
                                                    <li key={i}>{q}</li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                            {application.ai_interview_prep.talking_points &&
                                application.ai_interview_prep.talking_points
                                    .length > 0 && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-foreground">
                                            Talking Points
                                        </span>
                                        <ul className="list-inside list-disc text-xs text-muted-foreground">
                                            {application.ai_interview_prep.talking_points.map(
                                                (tp, i) => (
                                                    <li key={i}>{tp}</li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                            {application.ai_interview_prep.tips &&
                                application.ai_interview_prep.tips.length >
                                    0 && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-foreground">
                                            Tips
                                        </span>
                                        <ul className="list-inside list-disc text-xs text-muted-foreground">
                                            {application.ai_interview_prep.tips.map(
                                                (t, i) => (
                                                    <li key={i}>{t}</li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            )}

            {(application.status === 'applied' ||
                application.status === 'interviewing') &&
                application.staleness_level !== null && (
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
                            <p className="text-xs text-destructive">
                                {followUpError}
                            </p>
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
                                        navigator.clipboard.writeText(
                                            followUpDraft,
                                        );
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
