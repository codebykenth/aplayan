import { Head, router, useForm } from '@inertiajs/react';
import { Sun, Moon, Monitor, User, KeyRound, Palette } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { useTheme, useColorTheme } from '@/hooks/use-theme';
import AppLayout from '@/layouts/app-layout';
import settings from '@/routes/settings';

const THEME_OPTIONS = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
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
                        <User className="size-4" />
                        Profile
                    </CardTitle>
                    <CardDescription>
                        Update your name, email, and job search preferences.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Name</Label>
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
                        <Label htmlFor="email">Email</Label>
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
                            Expected Salary (₱)
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
                        {processing ? 'Saving...' : 'Save Changes'}
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
                        <KeyRound className="size-4" />
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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="size-4" />
                    Appearance
                </CardTitle>
                <CardDescription>
                    Customize your theme and accent color. System follows your device settings.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <Label className="text-sm font-medium">Mode</Label>
                    <fieldset className="flex flex-col gap-2">
                        <legend className="sr-only">Theme mode selection</legend>
                        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                            <label
                                key={value}
                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                                    mode === value
                                        ? 'border-primary bg-accent'
                                        : 'border-input hover:bg-muted'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="theme"
                                    value={value}
                                    checked={mode === value}
                                    onChange={() => handleModeChange(value)}
                                    className="sr-only"
                                />
                                <Icon className="size-5 shrink-0 text-muted-foreground" />
                                <span className="font-medium">{label}</span>
                                {mode === value && (
                                    <span className="ml-auto text-xs text-primary">
                                        Active
                                    </span>
                                )}
                            </label>
                        ))}
                    </fieldset>
                </div>

                <div className="flex flex-col gap-3">
                    <Label className="text-sm font-medium">Accent Color</Label>
                    <fieldset className="grid grid-cols-5 gap-2">
                        <legend className="sr-only">Color theme selection</legend>
                        {COLOR_THEME_OPTIONS.map(({ value, label, colors }) => (
                            <label
                                key={value}
                                className={`group relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${
                                    colorTheme === value
                                        ? 'border-primary bg-accent'
                                        : 'border-input hover:bg-muted'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="color_theme"
                                    value={value}
                                    checked={colorTheme === value}
                                    onChange={() => handleColorThemeChange(value)}
                                    className="sr-only"
                                />
                                <div className="flex gap-1">
                                    {colors.map((color, i) => (
                                        <div
                                            key={i}
                                            className="size-5 rounded-full ring-1 ring-border"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-medium">{label}</span>
                                {colorTheme === value && (
                                    <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                                        ✓
                                    </span>
                                )}
                            </label>
                        ))}
                    </fieldset>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SettingsIndex({ user }: SettingsPageProps) {
    return (
        <>
            <Head title="Settings" />

            <div className="flex flex-col gap-6">
                <PageHeader title="Settings" description="Manage your account settings and preferences." />

                <div className="flex flex-col gap-6 max-w-2xl">
                    <ProfileSection user={user} />
                    <PasswordSection />
                    <AppearanceSection />
                </div>
            </div>
        </>
    );
}

SettingsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;