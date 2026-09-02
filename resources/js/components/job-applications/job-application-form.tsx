import { usePage } from '@inertiajs/react';
import { HelpCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useFormSubmit } from '@/hooks/use-form-submit';
import {
    store as jobAppStore,
    update as jobAppUpdate,
} from '@/routes/job-applications';
import {
    JOB_APPLICATION_STATUSES,
    WORK_SETUP_OPTIONS,
} from '@/types/job-application';
import type { JobApplication } from '@/types/job-application';
import {
    CURRENCIES,
    getCurrencySymbol,
    convertCurrency,
} from '@/utils/currency';

interface FormData {
    company_name: string;
    job_title: string;
    job_url: string;
    job_description: string;
    location: string;
    work_setup: string;
    status: string;
    date_applied: string;
    expected_salary: string;
    offered_salary: string;
    currency: string;
    notes: string;
}

export default function JobApplicationForm({
    open,
    onClose,
    application,
}: {
    open: boolean;
    onClose: () => void;
    application?: JobApplication | null;
}) {
    const isEditing = !!application;
    const { auth } = usePage<{
        auth?: {
            user?: {
                base_currency?: string;
                expected_salary?: number | null;
                job_search_preferences?: {
                    work_setup?: string;
                    target_roles?: string;
                    target_industry?: string;
                } | null;
            };
        };
    }>().props;
    const userBaseCurrency = auth?.user?.base_currency || 'PHP';
    const userDefaultExpectedSalary =
        auth?.user?.expected_salary != null
            ? String(auth.user.expected_salary)
            : '';
    const userDefaultWorkSetup =
        auth?.user?.job_search_preferences?.work_setup &&
        auth.user.job_search_preferences.work_setup !== 'any'
            ? auth.user.job_search_preferences.work_setup
            : 'onsite';

    const targetRolesList = auth?.user?.job_search_preferences?.target_roles
        ? auth.user.job_search_preferences.target_roles
              .split(',')
              .map((r) => r.trim())
              .filter(Boolean)
        : [];
    const userDefaultJobTitle =
        targetRolesList.length === 1 ? targetRolesList[0] : '';

    const {
        data,
        setData,
        handleSubmit,
        processing,
        errors,
        reset,
        transform,
        clearErrors,
    } = useFormSubmit<FormData>({
        company_name: application?.company_name ?? '',
        job_title: application?.job_title ?? userDefaultJobTitle,
        job_url: application?.job_url ?? '',
        job_description: application?.job_description ?? '',
        location: application?.location ?? '',
        work_setup: application?.work_setup ?? userDefaultWorkSetup,
        status: application?.status ?? 'wishlist',
        date_applied: application?.date_applied ?? '',
        expected_salary:
            application?.expected_salary != null
                ? String(application.expected_salary)
                : userDefaultExpectedSalary,
        offered_salary:
            application?.offered_salary != null
                ? String(application.offered_salary)
                : '',
        currency: application?.currency ?? userBaseCurrency,
        notes: application?.notes ?? '',
    });

    useEffect(() => {
        if (open) {
            if (application) {
                setData({
                    company_name: application.company_name,
                    job_title: application.job_title,
                    job_url: application.job_url ?? '',
                    job_description: application.job_description ?? '',
                    location: application.location ?? '',
                    work_setup: application.work_setup ?? 'onsite',
                    status: application.status,
                    date_applied: application.date_applied ?? '',
                    expected_salary:
                        application.expected_salary != null
                            ? String(application.expected_salary)
                            : '',
                    offered_salary:
                        application.offered_salary != null
                            ? String(application.offered_salary)
                            : '',
                    currency: application.currency ?? 'PHP',
                    notes: application.notes ?? '',
                });
            } else {
                setData({
                    company_name: '',
                    job_title: userDefaultJobTitle,
                    job_url: '',
                    job_description: '',
                    location: '',
                    work_setup: userDefaultWorkSetup,
                    status: 'wishlist',
                    date_applied: '',
                    expected_salary: userDefaultExpectedSalary,
                    offered_salary: '',
                    currency: userBaseCurrency,
                    notes: '',
                });
            }
        }
    }, [
        open,
        application,
        userDefaultExpectedSalary,
        userDefaultWorkSetup,
        userDefaultJobTitle,
        userBaseCurrency,
        setData,
    ]);

    function handleClose() {
        reset();
        clearErrors();
        onClose();
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            expected_salary: formData.expected_salary
                ? Number(formData.expected_salary)
                : undefined,
            offered_salary: formData.offered_salary
                ? Number(formData.offered_salary)
                : undefined,
            job_url: formData.job_url || undefined,
            job_description: formData.job_description || undefined,
            location: formData.location || undefined,
            notes: formData.notes || undefined,
            date_applied: formData.date_applied || undefined,
        }));

        if (isEditing) {
            handleSubmit('put', jobAppUpdate.url(application!.id), {
                onSuccess: () => handleClose(),
            });
        } else {
            handleSubmit('post', jobAppStore.url(), {
                onSuccess: () => handleClose(),
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Application' : 'New Application'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the details of your job application.'
                            : 'Add a new job application to track.'}
                    </DialogDescription>
                </DialogHeader>

                <p className="mt-1 text-xs text-muted-foreground">
                    Fields marked with <span className="text-red-500">*</span>{' '}
                    are required.
                </p>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="company_name">
                                    Company Name{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="company_name"
                                    value={data.company_name}
                                    onChange={(e) =>
                                        setData('company_name', e.target.value)
                                    }
                                    aria-invalid={!!errors.company_name}
                                    placeholder="Acme Corp"
                                />
                                {errors.company_name && (
                                    <p className="text-xs text-destructive">
                                        {errors.company_name}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="job_title">
                                    Job Title{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="job_title"
                                    value={data.job_title}
                                    onChange={(e) =>
                                        setData('job_title', e.target.value)
                                    }
                                    aria-invalid={!!errors.job_title}
                                    placeholder="Software Engineer"
                                />
                                {(() => {
                                    const targetRolesList = auth?.user
                                        ?.job_search_preferences?.target_roles
                                        ? auth.user.job_search_preferences.target_roles
                                              .split(',')
                                              .map((r) => r.trim())
                                              .filter(Boolean)
                                        : [];

                                    if (
                                        !data.job_title &&
                                        targetRolesList.length > 0
                                    ) {
                                        return (
                                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                                <span className="text-[11px] font-medium text-muted-foreground">
                                                    Preset:
                                                </span>
                                                {targetRolesList.map((role) => (
                                                    <button
                                                        key={role}
                                                        type="button"
                                                        onClick={() =>
                                                            setData(
                                                                'job_title',
                                                                role,
                                                            )
                                                        }
                                                        className="rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        + {role}
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    }

                                    return null;
                                })()}
                                {errors.job_title && (
                                    <p className="text-xs text-destructive">
                                        {errors.job_title}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="work_setup">
                                    Work Setup{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.work_setup}
                                    onValueChange={(value: string | null) => {
                                        if (value) {
                                            setData('work_setup', value);
                                        }
                                    }}
                                >
                                    <SelectTrigger
                                        id="work_setup"
                                        aria-invalid={!!errors.work_setup}
                                    >
                                        <SelectValue>
                                            {WORK_SETUP_OPTIONS.find(
                                                (w) =>
                                                    w.value === data.work_setup,
                                            )?.label ?? 'Select work setup'}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {WORK_SETUP_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.work_setup && (
                                    <p className="text-xs text-destructive">
                                        {errors.work_setup}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="status">
                                    Status{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value: string | null) => {
                                        if (value) {
                                            setData('status', value);
                                        }
                                    }}
                                >
                                    <SelectTrigger
                                        aria-invalid={!!errors.status}
                                    >
                                        <SelectValue>
                                            {JOB_APPLICATION_STATUSES.find(
                                                (s) => s.value === data.status,
                                            )?.label ?? 'Select status'}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {JOB_APPLICATION_STATUSES.map(
                                            (status) => (
                                                <SelectItem
                                                    key={status.value}
                                                    value={status.value}
                                                >
                                                    {status.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-xs text-destructive">
                                        {errors.status}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="location">
                                Location (City / Address)
                            </Label>
                            <Input
                                id="location"
                                value={data.location}
                                onChange={(e) =>
                                    setData('location', e.target.value)
                                }
                                aria-invalid={!!errors.location}
                                placeholder="e.g. Makati City, Taguig, or San Francisco (Optional)"
                            />
                            {errors.location && (
                                <p className="text-xs text-destructive">
                                    {errors.location}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Currency</Label>
                            <Select
                                value={data.currency}
                                onValueChange={(newCurrency: string | null) => {
                                    if (!newCurrency) {
                                        return;
                                    }

                                    const oldCurrency = data.currency || 'PHP';

                                    if (oldCurrency === newCurrency) {
                                        return;
                                    }

                                    let newExpected = data.expected_salary;
                                    let newOffered = data.offered_salary;

                                    if (
                                        data.expected_salary &&
                                        !isNaN(Number(data.expected_salary))
                                    ) {
                                        const val = Number(
                                            data.expected_salary,
                                        );

                                        if (val > 0) {
                                            newExpected = String(
                                                convertCurrency(
                                                    val,
                                                    oldCurrency,
                                                    newCurrency,
                                                ),
                                            );
                                        }
                                    }

                                    if (
                                        data.offered_salary &&
                                        !isNaN(Number(data.offered_salary))
                                    ) {
                                        const val = Number(data.offered_salary);

                                        if (val > 0) {
                                            newOffered = String(
                                                convertCurrency(
                                                    val,
                                                    oldCurrency,
                                                    newCurrency,
                                                ),
                                            );
                                        }
                                    }

                                    setData((prev) => ({
                                        ...prev,
                                        currency: newCurrency,
                                        expected_salary: newExpected,
                                        offered_salary: newOffered,
                                    }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CURRENCIES.map((currency) => (
                                        <SelectItem
                                            key={currency.code}
                                            value={currency.code}
                                        >
                                            {currency.symbol} {currency.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.currency && (
                                <p className="text-xs text-destructive">
                                    {errors.currency}
                                </p>
                            )}
                        </div>

                        {(() => {
                            const showOfferedSalary =
                                data.status === 'offer' ||
                                data.status === 'rejected' ||
                                data.status === 'withdrawn' ||
                                Boolean(data.offered_salary);

                            return (
                                <div
                                    className={
                                        showOfferedSalary
                                            ? 'grid grid-cols-2 gap-4'
                                            : 'grid grid-cols-1 gap-4'
                                    }
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <Label htmlFor="expected_salary">
                                                Target / Asking Salary (
                                                {getCurrencySymbol(
                                                    data.currency,
                                                )}
                                                )
                                            </Label>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger
                                                        type="button"
                                                        className="cursor-help text-muted-foreground hover:text-foreground"
                                                    >
                                                        <HelpCircle className="size-3.5" />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p>
                                                            Your desired target
                                                            monthly salary for
                                                            this role. Prefilled
                                                            from your Profile
                                                            settings.
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                                                {getCurrencySymbol(
                                                    data.currency,
                                                )}
                                            </span>
                                            <Input
                                                id="expected_salary"
                                                type="number"
                                                min={0}
                                                className="pl-6"
                                                value={data.expected_salary}
                                                onChange={(e) =>
                                                    setData(
                                                        'expected_salary',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="50000"
                                            />
                                        </div>
                                        {errors.expected_salary && (
                                            <p className="text-xs text-destructive">
                                                {errors.expected_salary}
                                            </p>
                                        )}
                                    </div>

                                    {showOfferedSalary && (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <Label htmlFor="offered_salary">
                                                    Final Offered Salary (
                                                    {getCurrencySymbol(
                                                        data.currency,
                                                    )}
                                                    )
                                                </Label>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger
                                                            type="button"
                                                            className="cursor-help text-muted-foreground hover:text-foreground"
                                                        >
                                                            <HelpCircle className="size-3.5" />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">
                                                            <p>
                                                                The gross
                                                                monthly salary
                                                                offered by the
                                                                employer. Powers
                                                                your Net
                                                                Take-Home Pay &
                                                                Offer Comparison
                                                                tools.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <div className="relative">
                                                <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                                                    {getCurrencySymbol(
                                                        data.currency,
                                                    )}
                                                </span>
                                                <Input
                                                    id="offered_salary"
                                                    type="number"
                                                    min={0}
                                                    className="pl-6"
                                                    value={data.offered_salary}
                                                    onChange={(e) =>
                                                        setData(
                                                            'offered_salary',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="60000"
                                                />
                                            </div>
                                            {errors.offered_salary && (
                                                <p className="text-xs text-destructive">
                                                    {errors.offered_salary}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="job_url">Job URL</Label>
                                <Input
                                    id="job_url"
                                    type="url"
                                    value={data.job_url}
                                    onChange={(e) =>
                                        setData('job_url', e.target.value)
                                    }
                                    placeholder="https://example.com/job"
                                />
                                {errors.job_url && (
                                    <p className="text-xs text-destructive">
                                        {errors.job_url}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="date_applied">
                                    Date Applied
                                </Label>
                                <Input
                                    id="date_applied"
                                    type="date"
                                    value={data.date_applied}
                                    onChange={(e) =>
                                        setData('date_applied', e.target.value)
                                    }
                                />
                                {errors.date_applied && (
                                    <p className="text-xs text-destructive">
                                        {errors.date_applied}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="job_description">
                                Job Description
                            </Label>
                            <textarea
                                id="job_description"
                                rows={3}
                                value={data.job_description}
                                onChange={(e) =>
                                    setData('job_description', e.target.value)
                                }
                                className="h-20 max-h-32 w-full min-w-0 overflow-y-auto rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-input/30"
                                placeholder="Paste the job description here..."
                            />
                            {errors.job_description && (
                                <p className="text-xs text-destructive">
                                    {errors.job_description}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                rows={2}
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                className="h-16 max-h-24 w-full min-w-0 overflow-y-auto rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-input/30"
                                placeholder="Any additional notes..."
                            />
                            {errors.notes && (
                                <p className="text-xs text-destructive">
                                    {errors.notes}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Saving...'
                                : isEditing
                                  ? 'Update'
                                  : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
