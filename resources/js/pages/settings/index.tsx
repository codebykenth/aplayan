import { Head, router, useForm } from '@inertiajs/react';
import { Sun, Moon, Monitor, User, KeyRound, Palette, Check } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { useTheme, useColorTheme } from '@/hooks/use-theme';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import settings from '@/routes/settings';

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
    { value: 'zinc', label: 'Zinc', colors: ['oklch(0.205 0 0)', 'oklch(0.922 0 0)'] },
    { value: 'emerald', label: 'Emerald', colors: ['oklch(0.448 0.154 164.978)', 'oklch(0.696 0.17 162.48)'] },
    { value: 'ocean', label: 'Ocean', colors: ['oklch(0.375 0.143 259.433)', 'oklch(0.594 0.184 254.624)'] },
    { value: 'indigo', label: 'Indigo', colors: ['oklch(0.398 0.154 286.027)', 'oklch(0.612 0.214 282.755)'] },
    { value: 'sunset', label: 'Sunset', colors: ['oklch(0.544 0.185 22.555)', 'oklch(0.715 0.194 22.555)'] },
] as const;

type UserData = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    expected_salary: number | null;
    job_search_preferences: Record<string, unknown> | null;
    theme: string;
    color_theme: string;
};

interface SettingsPageProps {
    user: UserData;
}

function ProfileSection({ user }: { user: UserData }) {
    const { data, setData, patch, processing, errors, transform } = useForm({
        name: user.name,
        email: user.email,
        expected_salary: user.expected_salary != null ? String(user.expected_salary) : '',
        theme: user.theme,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            expected_salary: formData.expected_salary ? Number(formData.expected_salary) : null,
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
                        Update your public name, email address, and target compensation.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            aria-invalid={!!errors.email}
                        />
                        {errors.email && (
                            <p className="text-xs text-destructive">{errors.email}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="expected_salary">
                            Expected Target Salary (₱)
                        </Label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                ₱
                            </span>
                            <Input
                                id="expected_salary"
                                type="number"
                                min={0}
                                className="pl-6"
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
    const { data, setData, patch, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
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
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="current_password">
                            Current Password
                        </Label>
                        <Input
                            id="current_password"
                            type="password"
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
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
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
                            Confirm New Password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
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
        setColorTheme(value as 'zinc' | 'emerald' | 'ocean' | 'indigo' | 'sunset');
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
                    Customize your interface theme mode and primary color scheme.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                {/* Mode Selector */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Theme Mode</Label>
                        <span className="text-xs text-muted-foreground">Select interface style</span>
                    </div>
                    <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <legend className="sr-only">Theme mode selection</legend>
                        {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => {
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
                                        onChange={() => handleModeChange(value)}
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
                                        <p className="text-sm font-medium text-foreground">{label}</p>
                                        <p className="text-xs text-muted-foreground">{description}</p>
                                    </div>
                                </label>
                            );
                        })}
                    </fieldset>
                </div>

                {/* Accent Color Selector */}
                <div className="flex flex-col gap-3 border-t pt-5">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Accent Color</Label>
                        <span className="text-xs text-muted-foreground">Personalize highlight colors</span>
                    </div>
                    <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        <legend className="sr-only">Color theme selection</legend>
                        {COLOR_THEME_OPTIONS.map(({ value, label, colors }) => {
                            const isSelected = colorTheme === value;
                            return (
                                <label
                                    key={value}
                                    className={cn(
                                        'group relative flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border p-3.5 transition-all text-center',
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
                                        onChange={() => handleColorThemeChange(value)}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center gap-1.5">
                                        {colors.map((color, i) => (
                                            <div
                                                key={i}
                                                className="size-5 rounded-full ring-1 ring-black/10 dark:ring-white/20 shadow-xs"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs font-medium text-foreground">{label}</span>
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

export default function SettingsIndex({ user }: SettingsPageProps) {
    const [activeTab, setActiveTab] = useState<'appearance' | 'profile' | 'password'>('appearance');

    return (
        <>
            <Head title="Settings" />

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2 pb-8">
                <PageHeader title="Settings" description="Manage your account settings, password, and theme preferences." />

                {/* Tab Navigation Controls */}
                <div className="flex items-center gap-1 border-b border-border pb-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('appearance')}
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
                        onClick={() => setActiveTab('profile')}
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
                        onClick={() => setActiveTab('password')}
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
                </div>

                {/* Main Settings Content Panels */}
                <div className="max-w-2xl">
                    {activeTab === 'appearance' && <AppearanceSection />}
                    {activeTab === 'profile' && <ProfileSection user={user} />}
                    {activeTab === 'password' && <PasswordSection />}
                </div>
            </div>
        </>
    );
}

SettingsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;