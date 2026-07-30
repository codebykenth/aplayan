import { Head, router, useForm } from '@inertiajs/react';
import {
    Sun,
    Moon,
    Monitor,
    User,
    KeyRound,
    Palette,
    Check,
    Receipt,
    PlusIcon,
    TrashIcon,
    HelpCircle,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTheme, useColorTheme } from '@/hooks/use-theme';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import {
    profileSchema,
    passwordSchema as passwordSchemaZod,
    validateWithZod,
} from '@/lib/validations';
import settings from '@/routes/settings';
import type {
    TaxSettings,
    TaxAllowance,
    TaxCustomDeduction,
} from '@/types/job-application';
import { TAX_REGIMES } from '@/types/job-application';
import { CURRENCIES, getCurrencySymbol } from '@/utils/currency';

const THEME_OPTIONS = [
    {
        value: 'light',
        label: 'Light',
        description: 'Clean light interface',
        icon: Sun,
    },
    {
        value: 'dark',
        label: 'Dark',
        description: 'Easy on the eyes',
        icon: Moon,
    },
    {
        value: 'system',
        label: 'System',
        description: 'Matches device settings',
        icon: Monitor,
    },
] as const;

const COLOR_THEME_OPTIONS = [
    {
        value: 'zinc',
        label: 'Zinc',
        colors: ['oklch(0.205 0 0)', 'oklch(0.922 0 0)'],
    },
    {
        value: 'emerald',
        label: 'Emerald',
        colors: ['oklch(0.448 0.154 164.978)', 'oklch(0.696 0.17 162.48)'],
    },
    {
        value: 'ocean',
        label: 'Ocean',
        colors: ['oklch(0.375 0.143 259.433)', 'oklch(0.594 0.184 254.624)'],
    },
    {
        value: 'indigo',
        label: 'Indigo',
        colors: ['oklch(0.398 0.154 286.027)', 'oklch(0.612 0.214 282.755)'],
    },
    {
        value: 'sunset',
        label: 'Sunset',
        colors: ['oklch(0.544 0.185 22.555)', 'oklch(0.715 0.194 22.555)'],
    },
] as const;

const PREFERRED_WORK_SETUP_OPTIONS = [
    { value: 'any', label: 'Any / Flexible' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
] as const;

const SUGGESTED_JOB_ROLES = [
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Engineer',
    'Mobile Developer',
    'DevOps Engineer',
    'Data Analyst',
    'UI/UX Designer',
    'Product Manager',
];

const SUGGESTED_INDUSTRIES = [
    'Software / SaaS',
    'FinTech',
    'E-Commerce',
    'HealthTech',
    'EdTech',
    'Artificial Intelligence',
    'Cybersecurity',
    'Financial Services',
];

type UserData = {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    avatar?: string;
    expected_salary: number | null;
    base_currency?: string;
    job_search_preferences: Record<string, unknown> | null;
    theme: string;
    color_theme: string;
    tax_settings: TaxSettings | null;
};

interface SettingsPageProps {
    user: UserData;
}

function ProfileSection({ user }: { user: UserData }) {
    const isEmailVerified = !!user.email_verified_at;
    const initialPreferences = (user.job_search_preferences as {
        target_roles?: string;
        work_setup?: string;
        target_industry?: string;
    }) || {};

    const {
        data,
        setData,
        patch,
        processing,
        errors,
        transform,
        setError,
        clearErrors,
    } = useForm({
        name: user.name,
        email: user.email,
        expected_salary:
            user.expected_salary != null ? String(user.expected_salary) : '',
        base_currency: user.base_currency || 'PHP',
        theme: user.theme,
        color_theme: user.color_theme,
        job_search_preferences: {
            target_roles: initialPreferences.target_roles || '',
            work_setup: initialPreferences.work_setup || 'any',
            target_industry: initialPreferences.target_industry || '',
        },
    });

    function addRoleSuggestion(role: string) {
        const current = data.job_search_preferences.target_roles.trim();
        if (!current) {
            setData('job_search_preferences', {
                ...data.job_search_preferences,
                target_roles: role,
            });
        } else if (!current.toLowerCase().includes(role.toLowerCase())) {
            setData('job_search_preferences', {
                ...data.job_search_preferences,
                target_roles: `${current}, ${role}`,
            });
        }
    }

    function addIndustrySuggestion(industry: string) {
        const current = data.job_search_preferences.target_industry.trim();
        if (!current) {
            setData('job_search_preferences', {
                ...data.job_search_preferences,
                target_industry: industry,
            });
        } else if (!current.toLowerCase().includes(industry.toLowerCase())) {
            setData('job_search_preferences', {
                ...data.job_search_preferences,
                target_industry: `${current}, ${industry}`,
            });
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const result = validateWithZod(profileSchema, {
            name: data.name,
            email: data.email,
            expected_salary: Number(data.expected_salary),
            base_currency: data.base_currency,
            job_search_preferences: data.job_search_preferences,
        });

        if (!result.success) {
            clearErrors();
            for (const [field, message] of Object.entries(result.errors)) {
                setError(field as keyof typeof data, message);
            }
            return;
        }

        transform((formData) => ({
            ...formData,
            expected_salary: formData.expected_salary
                ? Number(formData.expected_salary)
                : null,
        }));

        patch(settings.profile.update.url());
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="size-4 text-primary" />
                        Profile Preferences
                    </CardTitle>
                    <CardDescription>
                        Update your public name, email address, default
                        currency, target compensation, and career targeting options.
                    </CardDescription>
                </CardHeader>
<CardContent className="flex flex-col gap-4">
                     <p className="text-xs text-muted-foreground">
                         Fields marked with <span className="text-red-500">*</span> are required.
                     </p>
                     <div className="flex flex-col gap-2">
                         <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                            {isEmailVerified && (
                                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    Verified
                                </span>
                            )}
                        </div>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            disabled={isEmailVerified}
                            onChange={(e) => setData('email', e.target.value)}
                            aria-invalid={!!errors.email}
                            className={cn(
                                isEmailVerified &&
                                    'cursor-not-allowed bg-muted opacity-80',
                            )}
                        />
                        {isEmailVerified ? (
                            <p className="text-xs text-muted-foreground">
                                Verified email addresses cannot be changed.
                            </p>
                        ) : (
                            errors.email && (
                                <p className="text-xs text-destructive">
                                    {errors.email}
                                </p>
                            )
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                            <Label htmlFor="base_currency">Base Currency <span className="text-red-500">*</span></Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground cursor-help">
                                        <HelpCircle className="size-3.5" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Your primary currency. Used as the default currency for new applications and for normalizing multi-currency analytics charts.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Select
                            value={data.base_currency || 'PHP'}
                            onValueChange={(val) =>
                                setData('base_currency', val ?? 'PHP')
                            }
                        >
                            <SelectTrigger
                                id="base_currency"
                                aria-invalid={!!errors.base_currency}
                            >
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent side="bottom">
                                {CURRENCIES.map((c) => (
                                    <SelectItem key={c.code} value={c.code}>
                                        {c.symbol} {c.name} ({c.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.base_currency && (
                            <p className="text-xs text-destructive">
                                {errors.base_currency}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
<Label htmlFor="expected_salary">
                                 Default Target / Asking Salary (
                                 {getCurrencySymbol(data.base_currency || 'PHP')}) <span className="text-red-500">*</span>
                             </Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground cursor-help">
                                        <HelpCircle className="size-3.5" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Your default monthly target salary. Automatically prefilled when creating new job applications.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                                {getCurrencySymbol(data.base_currency || 'PHP')}
                            </span>
                            <Input
                                id="expected_salary"
                                type="number"
                                min={0}
                                className="pl-7"
                                value={data.expected_salary}
                                onChange={(e) =>
                                    setData('expected_salary', e.target.value)
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

                    <div className="flex flex-col gap-3 border-t border-border pt-4">
                        <div>
                            <Label className="text-sm font-semibold">
                                Job Search Preferences
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Help AI tailor your resume, cover letter, and career recommendations.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1.5">
<Label htmlFor="target_roles" className="text-xs">
                                     Target Job Roles / Titles <span className="text-red-500">*</span>
                                 </Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground cursor-help">
                                            <HelpCircle className="size-3.5" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p>Used as 1-click preset chips when creating new job applications, and for AI Resume target headlines.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Input
                                id="target_roles"
                                value={data.job_search_preferences.target_roles}
                                onChange={(e) =>
                                    setData('job_search_preferences', {
                                        ...data.job_search_preferences,
                                        target_roles: e.target.value,
                                    })
                                }
                                placeholder="e.g. Full Stack Developer, React Engineer"
                            />
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[11px] font-medium text-muted-foreground">Suggested:</span>
                                {SUGGESTED_JOB_ROLES.map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => addRoleSuggestion(role)}
                                        className="rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                                    >
                                        + {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1.5">
<Label htmlFor="work_setup" className="text-xs">
                                         Preferred Work Arrangement <span className="text-red-500">*</span>
                                     </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground cursor-help">
                                                <HelpCircle className="size-3.5" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <p>Default work setup (Remote, Hybrid, On-site) prefilled when adding new job applications.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Select
                                    value={data.job_search_preferences.work_setup}
                                    onValueChange={(val) =>
                                        setData('job_search_preferences', {
                                            ...data.job_search_preferences,
                                            work_setup: val ?? 'any',
                                        })
                                    }
                                >
                                    <SelectTrigger id="work_setup">
                                        <SelectValue>
                                            {PREFERRED_WORK_SETUP_OPTIONS.find(
                                                (o) =>
                                                    o.value ===
                                                    data.job_search_preferences.work_setup,
                                            )?.label ?? 'Select work setup'}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent side="bottom">
                                        {PREFERRED_WORK_SETUP_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1.5">
<Label htmlFor="target_industry" className="text-xs">
                                         Target Industry / Specialization <span className="text-red-500">*</span>
                                     </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground cursor-help">
                                                <HelpCircle className="size-3.5" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <p>Used by AI Resume Match & Cover Letter Copilot to provide domain-specific insights for your industry.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    id="target_industry"
                                    value={data.job_search_preferences.target_industry}
                                    onChange={(e) =>
                                        setData('job_search_preferences', {
                                            ...data.job_search_preferences,
                                            target_industry: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Software/SaaS, FinTech, E-Commerce"
                                />
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[11px] font-medium text-muted-foreground">Suggested:</span>
                                    {SUGGESTED_INDUSTRIES.map((industry) => (
                                        <button
                                            key={industry}
                                            type="button"
                                            onClick={() => addIndustrySuggestion(industry)}
                                            className="rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                                        >
                                            + {industry}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <div className="flex items-center justify-end border-t px-(--card-spacing) py-(--card-spacing)">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save Profile'}
                    </Button>
                </div>
            </Card>
        </form>
    );
}

function PasswordSection() {
    const {
        data,
        setData,
        patch,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const result = validateWithZod(passwordSchemaZod, data);

        if (!result.success) {
            clearErrors();
            for (const [field, message] of Object.entries(result.errors)) {
                setError(field as keyof typeof data, message);
            }
            return;
        }

        patch(settings.password.update.url(), {
            onSuccess: () => reset(),
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="size-4 text-primary" />
                        Password & Security
                    </CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>
<CardContent className="flex flex-col gap-4">
                     <p className="text-xs text-muted-foreground">
                         Fields marked with <span className="text-red-500">*</span> are required.
                     </p>
                     <div className="flex flex-col gap-2">
                         <Label htmlFor="current_password">
                             Current Password <span className="text-red-500">*</span>
                         </Label>
                        <PasswordInput
                            id="current_password"
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            aria-invalid={!!errors.current_password}
                            autoComplete="current-password"
                        />
                        {errors.current_password && (
                            <p className="text-xs text-destructive">
                                {errors.current_password}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">New Password <span className="text-red-500">*</span></Label>
                        <PasswordInput
                            id="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            aria-invalid={!!errors.password}
                            autoComplete="new-password"
                        />
                        {errors.password && (
                            <p className="text-xs text-destructive">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
<Label htmlFor="password_confirmation">
                             Confirm New Password <span className="text-red-500">*</span>
                         </Label>
                        <PasswordInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            aria-invalid={!!errors.password_confirmation}
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && (
                            <p className="text-xs text-destructive">
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>
                </CardContent>
                <div className="flex items-center justify-end border-t px-(--card-spacing) py-(--card-spacing)">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Updating...' : 'Update Password'}
                    </Button>
                </div>
            </Card>
        </form>
    );
}

function AppearanceSection() {
    const { mode, setMode } = useTheme();
    const { colorTheme, setColorTheme } = useColorTheme();

    function handleModeChange(value: string) {
        setMode(value as 'light' | 'dark' | 'system');
        router.patch(settings.theme.update.url(), {
            theme: value,
        });
    }

    function handleColorThemeChange(value: string) {
        setColorTheme(
            value as 'zinc' | 'emerald' | 'ocean' | 'indigo' | 'sunset',
        );
        router.patch(settings.colorTheme.update.url(), {
            color_theme: value,
        });
    }

    return (
        <Card id="appearance-section">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="size-4 text-primary" />
                    Theme & Appearance
                </CardTitle>
                <CardDescription>
                    Customize your interface theme mode and primary color
                    scheme.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                {/* Mode Selector */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">
                            Theme Mode
                        </Label>
                        <span className="text-xs text-muted-foreground">
                            Select interface style
                        </span>
                    </div>
                    <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <legend className="sr-only">
                            Theme mode selection
                        </legend>
                        {THEME_OPTIONS.map(
                            ({ value, label, description, icon: Icon }) => {
                                const isSelected = mode === value;

                                return (
                                    <label
                                        key={value}
                                        className={cn(
                                            'group relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-all',
                                            isSelected
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                : 'border-border bg-card hover:border-foreground/20 hover:bg-muted/50',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="theme"
                                            value={value}
                                            checked={isSelected}
                                            onChange={() =>
                                                handleModeChange(value)
                                            }
                                            className="sr-only"
                                        />
                                        <div className="flex items-center justify-between">
                                            <div
                                                className={cn(
                                                    'flex size-9 items-center justify-center rounded-lg border transition-colors',
                                                    isSelected
                                                        ? 'border-primary/30 bg-primary/10 text-primary'
                                                        : 'border-border bg-muted text-muted-foreground group-hover:text-foreground',
                                                )}
                                            >
                                                <Icon className="size-4" />
                                            </div>
                                            {isSelected && (
                                                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                    <Check className="size-3 stroke-[3]" />
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {description}
                                            </p>
                                        </div>
                                    </label>
                                );
                            },
                        )}
                    </fieldset>
                </div>

                {/* Accent Color Selector */}
                <div className="flex flex-col gap-3 border-t pt-5">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">
                            Accent Color
                        </Label>
                        <span className="text-xs text-muted-foreground">
                            Personalize highlight colors
                        </span>
                    </div>
                    <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        <legend className="sr-only">
                            Color theme selection
                        </legend>
                        {COLOR_THEME_OPTIONS.map(({ value, label, colors }) => {
                            const isSelected = colorTheme === value;

                            return (
                                <label
                                    key={value}
                                    className={cn(
                                        'group relative flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border p-3.5 text-center transition-all',
                                        isSelected
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                            : 'border-border bg-card hover:border-foreground/20 hover:bg-muted/50',
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="color_theme"
                                        value={value}
                                        checked={isSelected}
                                        onChange={() =>
                                            handleColorThemeChange(value)
                                        }
                                        className="sr-only"
                                    />
                                    <div className="flex items-center gap-1.5">
                                        {colors.map((color, i) => (
                                            <div
                                                key={i}
                                                className="size-5 rounded-full shadow-xs ring-1 ring-black/10 dark:ring-white/20"
                                                style={{
                                                    backgroundColor: color,
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs font-medium text-foreground">
                                        {label}
                                    </span>
                                    {isSelected && (
                                        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                                            <Check className="size-3 stroke-[3]" />
                                        </span>
                                    )}
                                </label>
                            );
                        })}
                    </fieldset>
                </div>
            </CardContent>
        </Card>
    );
}

function TaxSettingsSection({ user }: { user: UserData }) {
    const { data, setData, patch, processing } = useForm({
        tax_settings: {
            regime: user.tax_settings?.regime ?? 'ph_regular',
            allowances: user.tax_settings?.allowances ?? [],
            custom_deductions: user.tax_settings?.custom_deductions ?? [],
            override_sss: user.tax_settings?.override_sss ?? null,
            override_philhealth: user.tax_settings?.override_philhealth ?? null,
            override_pagibig: user.tax_settings?.override_pagibig ?? null,
            override_bir_tax: user.tax_settings?.override_bir_tax ?? null,
        },
    });
    const taxSettings = data.tax_settings;

    function updateSettings(
        updater: (prev: typeof taxSettings) => typeof taxSettings,
    ) {
        setData('tax_settings', updater(taxSettings));
    }

    function handleSave() {
        patch(settings.tax.update.url(), {
            preserveScroll: true,
        });
    }

    function addAllowance(taxable: boolean) {
        updateSettings((prev) => ({
            ...prev,
            allowances: [...prev.allowances, { name: '', amount: 0, taxable }],
        }));
    }

    function removeAllowance(index: number) {
        updateSettings((prev) => ({
            ...prev,
            allowances: prev.allowances.filter((_, i) => i !== index),
        }));
    }

    function updateAllowance(
        index: number,
        field: keyof TaxAllowance,
        value: string | number | boolean,
    ) {
        updateSettings((prev) => ({
            ...prev,
            allowances: prev.allowances.map((a, i) =>
                i === index ? { ...a, [field]: value } : a,
            ),
        }));
    }

    function addCustomDeduction() {
        updateSettings((prev) => ({
            ...prev,
            custom_deductions: [
                ...prev.custom_deductions,
                { name: '', amount: 0 },
            ],
        }));
    }

    function removeCustomDeduction(index: number) {
        updateSettings((prev) => ({
            ...prev,
            custom_deductions: prev.custom_deductions.filter(
                (_, i) => i !== index,
            ),
        }));
    }

    function updateCustomDeduction(
        index: number,
        field: keyof TaxCustomDeduction,
        value: string | number,
    ) {
        updateSettings((prev) => ({
            ...prev,
            custom_deductions: prev.custom_deductions.map((d, i) =>
                i === index ? { ...d, [field]: value } : d,
            ),
        }));
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="size-4 text-primary" />
                    Global Tax Preferences
                </CardTitle>
                <CardDescription>
                    Set default tax regime, standard allowances, and statutory
                    contribution overrides. These apply to all offer comparisons
                    unless customized per-offer.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label>Default Tax Regime</Label>
                    <Select
                        value={taxSettings.regime}
                        onValueChange={(value) =>
                            updateSettings((prev) => ({
                                ...prev,
                                regime: value as TaxSettings['regime'],
                            }))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue>
                                {TAX_REGIMES.find(
                                    (r) => r.value === taxSettings.regime,
                                )?.label ?? 'Select Tax Regime'}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent
                            alignItemWithTrigger={false}
                            side="bottom"
                            sideOffset={4}
                        >
                            {TAX_REGIMES.map((regime) => (
                                <SelectItem
                                    key={regime.value}
                                    value={regime.value}
                                >
                                    <div className="flex flex-col">
                                        <span>{regime.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {regime.description}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-3 border-t border-border pt-4">
                    <div>
                        <Label className="text-sm font-semibold">
                            Statutory Contribution Overrides (Optional)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Leave empty to automatically calculate deductions
                            using official 2026 Philippine government statutory
                            rates.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
<Label htmlFor="override_sss" className="text-xs">
                                 SSS Monthly (₱) <span className="text-red-500">*</span>
                             </Label>
                            <Input
                                id="override_sss"
                                type="number"
                                min={0}
                                placeholder="Auto (2026 SSS Table)"
                                value={taxSettings.override_sss ?? ''}
                                onChange={(e) =>
                                    updateSettings((prev) => ({
                                        ...prev,
                                        override_sss:
                                            e.target.value !== ''
                                                ? parseFloat(e.target.value)
                                                : null,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
<Label
                                 htmlFor="override_philhealth"
                                 className="text-xs"
                             >
                                 PhilHealth Monthly (₱) <span className="text-red-500">*</span>
                             </Label>
                            <Input
                                id="override_philhealth"
                                type="number"
                                min={0}
                                placeholder="Auto (5% Share)"
                                value={taxSettings.override_philhealth ?? ''}
                                onChange={(e) =>
                                    updateSettings((prev) => ({
                                        ...prev,
                                        override_philhealth:
                                            e.target.value !== ''
                                                ? parseFloat(e.target.value)
                                                : null,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
<Label
                                 htmlFor="override_pagibig"
                                 className="text-xs"
                             >
                                 Pag-IBIG Monthly (₱) <span className="text-red-500">*</span>
                             </Label>
                            <Input
                                id="override_pagibig"
                                type="number"
                                min={0}
                                placeholder="Auto (₱100 Cap)"
                                value={taxSettings.override_pagibig ?? ''}
                                onChange={(e) =>
                                    updateSettings((prev) => ({
                                        ...prev,
                                        override_pagibig:
                                            e.target.value !== ''
                                                ? parseFloat(e.target.value)
                                                : null,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
<Label
                                 htmlFor="override_bir_tax"
                                 className="text-xs"
                             >
                                 BIR Income Tax Monthly (₱) <span className="text-red-500">*</span>
                             </Label>
                            <Input
                                id="override_bir_tax"
                                type="number"
                                min={0}
                                placeholder="Auto (BIR TRAIN Law)"
                                value={taxSettings.override_bir_tax ?? ''}
                                onChange={(e) =>
                                    updateSettings((prev) => ({
                                        ...prev,
                                        override_bir_tax:
                                            e.target.value !== ''
                                                ? parseFloat(e.target.value)
                                                : null,
                                    }))
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <Label>Non-Taxable Allowances</Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addAllowance(false)}
                        >
                            <PlusIcon className="size-3.5" />
                            Add
                        </Button>
                    </div>
                    {taxSettings.allowances.filter((a) => !a.taxable).length ===
                        0 && (
                        <p className="text-xs text-muted-foreground">
                            No non-taxable allowances configured.
                        </p>
                    )}
                    {taxSettings.allowances
                        .map((a, i) => ({ ...a, originalIndex: i }))
                        .filter((a) => !a.taxable)
                        .map((a) => (
                            <div
                                key={a.originalIndex}
                                className="flex items-center gap-2"
                            >
                                <Input
                                    placeholder="Name (e.g. Rice Allowance)"
                                    value={a.name}
                                    onChange={(e) =>
                                        updateAllowance(
                                            a.originalIndex,
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    className="flex-1"
                                />
                                <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={a.amount || ''}
                                    onChange={(e) =>
                                        updateAllowance(
                                            a.originalIndex,
                                            'amount',
                                            parseFloat(e.target.value) || 0,
                                        )
                                    }
                                    className="w-28"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() =>
                                        removeAllowance(a.originalIndex)
                                    }
                                >
                                    <TrashIcon className="size-3.5" />
                                </Button>
                            </div>
                        ))}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <Label>Taxable Allowances</Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addAllowance(true)}
                        >
                            <PlusIcon className="size-3.5" />
                            Add
                        </Button>
                    </div>
                    {taxSettings.allowances.filter((a) => a.taxable).length ===
                        0 && (
                        <p className="text-xs text-muted-foreground">
                            No taxable allowances configured.
                        </p>
                    )}
                    {taxSettings.allowances
                        .map((a, i) => ({ ...a, originalIndex: i }))
                        .filter((a) => a.taxable)
                        .map((a) => (
                            <div
                                key={a.originalIndex}
                                className="flex items-center gap-2"
                            >
                                <Input
                                    placeholder="Name (e.g. Monthly Bonus)"
                                    value={a.name}
                                    onChange={(e) =>
                                        updateAllowance(
                                            a.originalIndex,
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    className="flex-1"
                                />
                                <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={a.amount || ''}
                                    onChange={(e) =>
                                        updateAllowance(
                                            a.originalIndex,
                                            'amount',
                                            parseFloat(e.target.value) || 0,
                                        )
                                    }
                                    className="w-28"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() =>
                                        removeAllowance(a.originalIndex)
                                    }
                                >
                                    <TrashIcon className="size-3.5" />
                                </Button>
                            </div>
                        ))}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <Label>Custom Deductions</Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addCustomDeduction}
                        >
                            <PlusIcon className="size-3.5" />
                            Add
                        </Button>
                    </div>
                    {taxSettings.custom_deductions.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                            No custom deductions configured.
                        </p>
                    )}
                    {taxSettings.custom_deductions.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Input
                                placeholder="Name (e.g. HMO Dependent)"
                                value={d.name}
                                onChange={(e) =>
                                    updateCustomDeduction(
                                        i,
                                        'name',
                                        e.target.value,
                                    )
                                }
                                className="flex-1"
                            />
                            <Input
                                type="number"
                                placeholder="Amount"
                                value={d.amount || ''}
                                onChange={(e) =>
                                    updateCustomDeduction(
                                        i,
                                        'amount',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                className="w-28"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeCustomDeduction(i)}
                            >
                                <TrashIcon className="size-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
            <div className="flex items-center justify-end border-t px-(--card-spacing) py-(--card-spacing)">
                <Button
                    type="button"
                    onClick={handleSave}
                    disabled={processing}
                >
                    {processing ? 'Saving...' : 'Save Tax Settings'}
                </Button>
            </div>
        </Card>
    );
}

const VALID_TABS = ['profile', 'appearance', 'password', 'tax'] as const;
type SettingsTab = (typeof VALID_TABS)[number];

function getInitialSettingsTab(): SettingsTab {
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTab = urlParams.get('tab') as SettingsTab | null;
        if (urlTab && VALID_TABS.includes(urlTab)) {
            return urlTab;
        }
        const savedTab = localStorage.getItem(
            'settings_active_tab',
        ) as SettingsTab | null;
        if (savedTab && VALID_TABS.includes(savedTab)) {
            return savedTab;
        }
    }
    return 'profile';
}

export default function SettingsIndex({ user }: SettingsPageProps) {
    const [activeTab, setActiveTabState] = useState<SettingsTab>(
        getInitialSettingsTab,
    );

    const handleTabChange = (tab: SettingsTab) => {
        setActiveTabState(tab);
        if (typeof window !== 'undefined') {
            localStorage.setItem('settings_active_tab', tab);
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            window.history.replaceState({}, '', url.toString());
        }
    };

    return (
        <>
            <Head title="Settings" />

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2 pb-8">
                <PageHeader
                    title="Settings"
                    description="Manage your account settings, password, and theme preferences."
                />

                {/* Tab Navigation Controls */}
                <div className="flex items-center gap-1 border-b border-border pb-1">
                    <button
                        type="button"
                        onClick={() => handleTabChange('profile')}
                        className={cn(
                            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                            activeTab === 'profile'
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                    >
                        <User className="size-4" />
                        Profile
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('appearance')}
                        className={cn(
                            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                            activeTab === 'appearance'
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                    >
                        <Palette className="size-4" />
                        Appearance & Theme
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('password')}
                        className={cn(
                            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                            activeTab === 'password'
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                    >
                        <KeyRound className="size-4" />
                        Password & Security
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('tax')}
                        className={cn(
                            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                            activeTab === 'tax'
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                    >
                        <Receipt className="size-4" />
                        Tax Preferences
                    </button>
                </div>

                {/* Main Settings Content Panels */}
                <div className="w-full flex-1">
                    {activeTab === 'profile' && <ProfileSection user={user} />}
                    {activeTab === 'appearance' && <AppearanceSection />}
                    {activeTab === 'password' && <PasswordSection />}
                    {activeTab === 'tax' && <TaxSettingsSection user={user} />}
                </div>
            </div>
        </>
    );
}

SettingsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
