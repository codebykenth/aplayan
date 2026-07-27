import { Head, router, useForm } from '@inertiajs/react';
import { Sun, Moon, Monitor, User, KeyRound, Palette } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/use-theme';
import AppLayout from '@/layouts/app-layout';
import settings from '@/routes/settings';

const THEME_OPTIONS = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
] as const;

type UserData = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    expected_salary: number | null;
    job_search_preferences: Record<string, unknown> | null;
    theme: string;
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
    const { theme, setTheme } = useTheme();

    function handleThemeChange(value: string) {
        setTheme(value);
        router.patch(settings.theme.update.url(), {
            theme: value,
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
                    Choose your preferred theme. System follows your device settings.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <fieldset className="flex flex-col gap-3">
                    <legend className="sr-only">Theme selection</legend>
                    {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                        <label
                            key={value}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                                theme === value
                                    ? 'border-primary bg-accent'
                                    : 'border-input hover:bg-muted'
                            }`}
                        >
                            <input
                                type="radio"
                                name="theme"
                                value={value}
                                checked={theme === value}
                                onChange={() => handleThemeChange(value)}
                                className="sr-only"
                            />
                            <Icon className="size-5 shrink-0 text-muted-foreground" />
                            <span className="font-medium">{label}</span>
                            {theme === value && (
                                <span className="ml-auto text-xs text-primary">
                                    Active
                                </span>
                            )}
                        </label>
                    ))}
                </fieldset>
            </CardContent>
        </Card>
    );
}

export default function SettingsIndex({ user }: SettingsPageProps) {
    return (
        <>
            <Head title="Settings" />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>

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