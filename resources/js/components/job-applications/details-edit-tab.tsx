import TaxBreakdownCard from '@/components/job-applications/tax-breakdown-card';
import TaxConfigEditor from '@/components/job-applications/tax-config-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import { JOB_APPLICATION_STATUSES } from '@/types/job-application';
import type { JobApplication, TaxConfig } from '@/types/job-application';
import {
    CURRENCIES,
    getCurrencySymbol,
    convertCurrency,
} from '@/utils/currency';

interface DetailsEditTabProps {
    application: JobApplication;
    formData: {
        company_name: string;
        job_title: string;
        location: string;
        status: string;
        date_applied: string;
        expected_salary: string;
        offered_salary: string;
        currency: string;
        job_url: string;
        job_description: string;
        notes: string;
        interview_date: string;
        tax_config: TaxConfig | null;
    };
    onFieldChange: (field: string, value: string | number | null) => void;
    onTaxConfigChange: (taxConfig: TaxConfig) => void;
    errors: Record<string, string>;
    disabled?: boolean;
}

export default function DetailsEditTab({
    application,
    formData,
    onFieldChange,
    onTaxConfigChange,
    errors,
    disabled = false,
}: DetailsEditTabProps) {
    const shouldAutoExpandTaxConfig =
        formData.status === 'offer' ||
        (formData.offered_salary !== '' && Number(formData.offered_salary) > 0);

    return (
        <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
                Fields marked with <span className="text-red-500">*</span> are
                required.
            </p>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="company_name" className="text-xs">
                        Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) =>
                            onFieldChange('company_name', e.target.value)
                        }
                        aria-invalid={!!errors.company_name}
                        placeholder="Acme Corp"
                        className="h-8 text-xs"
                        disabled={disabled}
                    />
                    {errors.company_name && (
                        <p className="text-xs text-destructive">
                            {errors.company_name}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="job_title" className="text-xs">
                        Job Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="job_title"
                        value={formData.job_title}
                        onChange={(e) =>
                            onFieldChange('job_title', e.target.value)
                        }
                        aria-invalid={!!errors.job_title}
                        placeholder="Software Engineer"
                        className="h-8 text-xs"
                        disabled={disabled}
                    />
                    {errors.job_title && (
                        <p className="text-xs text-destructive">
                            {errors.job_title}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="location" className="text-xs">
                        Location
                    </Label>
                    <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                            onFieldChange('location', e.target.value)
                        }
                        aria-invalid={!!errors.location}
                        placeholder="Remote"
                        className="h-8 text-xs"
                        disabled={disabled}
                    />
                    {errors.location && (
                        <p className="text-xs text-destructive">
                            {errors.location}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label className="text-xs">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) =>
                            onFieldChange('status', value)
                        }
                        disabled={disabled}
                    >
                        <SelectTrigger
                            className="h-8 text-xs"
                            aria-invalid={!!errors.status}
                        >
                            <span className="line-clamp-1 flex flex-1 text-left">
                                {JOB_APPLICATION_STATUSES.find(
                                    (s) => s.value === formData.status,
                                )?.label || 'Select status'}
                            </span>
                        </SelectTrigger>
                        <SelectContent>
                            {JOB_APPLICATION_STATUSES.map((status) => (
                                <SelectItem
                                    key={status.value}
                                    value={status.value}
                                    label={status.label}
                                >
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.status && (
                        <p className="text-xs text-destructive">
                            {errors.status}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="date_applied" className="text-xs">
                        Date Applied <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="date_applied"
                        type="date"
                        value={formData.date_applied}
                        onChange={(e) =>
                            onFieldChange('date_applied', e.target.value)
                        }
                        className="h-8 text-xs"
                        disabled={disabled}
                    />
                    {errors.date_applied && (
                        <p className="text-xs text-destructive">
                            {errors.date_applied}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="interview_date" className="text-xs">
                        Interview Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="interview_date"
                        type="date"
                        value={formData.interview_date}
                        onChange={(e) =>
                            onFieldChange('interview_date', e.target.value)
                        }
                        className="h-8 text-xs"
                        disabled={disabled}
                    />
                    {errors.interview_date && (
                        <p className="text-xs text-destructive">
                            {errors.interview_date}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label className="text-xs">Currency</Label>
                <Select
                    value={formData.currency}
                    onValueChange={(newCurrency) => {
                        if (!newCurrency) {
                            return;
                        }

                        const oldCurrency = formData.currency || 'PHP';

                        if (oldCurrency === newCurrency) {
                            return;
                        }

                        onFieldChange('currency', newCurrency);

                        if (
                            formData.expected_salary &&
                            !isNaN(Number(formData.expected_salary))
                        ) {
                            const val = Number(formData.expected_salary);

                            if (val > 0) {
                                onFieldChange(
                                    'expected_salary',
                                    String(
                                        convertCurrency(
                                            val,
                                            oldCurrency,
                                            newCurrency,
                                        ),
                                    ),
                                );
                            }
                        }

                        if (
                            formData.offered_salary &&
                            !isNaN(Number(formData.offered_salary))
                        ) {
                            const val = Number(formData.offered_salary);

                            if (val > 0) {
                                onFieldChange(
                                    'offered_salary',
                                    String(
                                        convertCurrency(
                                            val,
                                            oldCurrency,
                                            newCurrency,
                                        ),
                                    ),
                                );
                            }
                        }
                    }}
                    disabled={disabled}
                >
                    <SelectTrigger
                        className="h-8 text-xs"
                        aria-invalid={!!errors.currency}
                    >
                        <span className="line-clamp-1 flex flex-1 text-left">
                            {CURRENCIES.find(
                                (c) => c.code === formData.currency,
                            )?.name || 'Select currency'}
                        </span>
                    </SelectTrigger>
                    <SelectContent>
                        {CURRENCIES.map((currency) => (
                            <SelectItem
                                key={currency.code}
                                value={currency.code}
                                label={`${currency.symbol} ${currency.name}`}
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

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="expected_salary" className="text-xs">
                        Expected Salary ({getCurrencySymbol(formData.currency)}){' '}
                        <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                            {getCurrencySymbol(formData.currency)}
                        </span>
                        <Input
                            id="expected_salary"
                            type="number"
                            min={0}
                            className="h-8 pl-6 text-xs"
                            value={formData.expected_salary}
                            onChange={(e) =>
                                onFieldChange('expected_salary', e.target.value)
                            }
                            placeholder="50000"
                            disabled={disabled}
                        />
                    </div>
                    {errors.expected_salary && (
                        <p className="text-xs text-destructive">
                            {errors.expected_salary}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="offered_salary" className="text-xs">
                        Offered Salary ({getCurrencySymbol(formData.currency)})
                    </Label>
                    <div className="relative">
                        <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                            {getCurrencySymbol(formData.currency)}
                        </span>
                        <Input
                            id="offered_salary"
                            type="number"
                            min={0}
                            className="h-8 pl-6 text-xs"
                            value={formData.offered_salary}
                            onChange={(e) =>
                                onFieldChange('offered_salary', e.target.value)
                            }
                            placeholder="60000"
                            disabled={disabled}
                        />
                    </div>
                    {errors.offered_salary && (
                        <p className="text-xs text-destructive">
                            {errors.offered_salary}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="job_url" className="text-xs">
                    Job URL
                </Label>
                <Input
                    id="job_url"
                    type="url"
                    value={formData.job_url}
                    onChange={(e) => onFieldChange('job_url', e.target.value)}
                    placeholder="https://example.com/job"
                    className="h-8 text-xs"
                    disabled={disabled}
                />
                {errors.job_url && (
                    <p className="text-xs text-destructive">{errors.job_url}</p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="job_description" className="text-xs">
                    Job Description
                </Label>
                <textarea
                    id="job_description"
                    rows={4}
                    value={formData.job_description}
                    onChange={(e) =>
                        onFieldChange('job_description', e.target.value)
                    }
                    className="max-h-32 w-full resize-none overflow-y-auto rounded-lg border border-input bg-transparent p-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
                    placeholder="Paste the job description here..."
                    disabled={disabled}
                />
                {errors.job_description && (
                    <p className="text-xs text-destructive">
                        {errors.job_description}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="notes" className="text-xs">
                    Notes
                </Label>
                <textarea
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => onFieldChange('notes', e.target.value)}
                    className="max-h-24 w-full resize-none overflow-y-auto rounded-lg border border-input bg-transparent p-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
                    placeholder="Any additional notes..."
                    disabled={disabled}
                />
                {errors.notes && (
                    <p className="text-xs text-destructive">{errors.notes}</p>
                )}
            </div>

            {application.tax_breakdown && (
                <TaxBreakdownCard taxBreakdown={application.tax_breakdown} />
            )}

            <TaxConfigEditor
                taxConfig={formData.tax_config}
                onChange={onTaxConfigChange}
                errors={errors}
                disabled={disabled}
                autoExpand={shouldAutoExpandTaxConfig}
            />
        </div>
    );
}
