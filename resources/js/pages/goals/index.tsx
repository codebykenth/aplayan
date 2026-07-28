import { Head, useForm } from '@inertiajs/react';
import { Flame, Target, TrendingUp, Save } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import goals from '@/routes/goals';

interface WeeklyHistoryItem {
    label: string;
    count: number;
    start_date: string;
    end_date: string;
    is_current: boolean;
}

interface GoalsPageProps {
    weekly_goal: number;
    current_streak: number;
    weekly_progress: number;
    four_week_average: number;
    weekly_history: WeeklyHistoryItem[];
}

function StreakBadge({ streak }: { streak: number }) {
    if (streak === 0) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-muted-foreground/30 px-3 py-1 text-xs text-muted-foreground">
                <Flame className="size-3.5" />
                No streak yet
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Flame className="size-3.5 text-orange-500" />
            {streak} {streak === 1 ? 'week' : 'weeks'}
        </span>
    );
}

function ProgressRing({ progress, goal }: { progress: number; goal: number }) {
    const percentage = goal > 0 ? Math.min(Math.round((progress / goal) * 100), 100) : 0;
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (percentage / 100) * circumference;
    const isComplete = progress >= goal;

    return (
        <div className="relative flex items-center justify-center">
            <svg width="140" height="140" className="-rotate-90">
                <circle cx="70" cy="70" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                    cx="70" cy="70" r="54"
                    fill="none"
                    stroke={isComplete ? 'hsl(142, 76%, 36%)' : 'hsl(var(--primary))'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground">{progress}</span>
                <span className="text-xs text-muted-foreground">of {goal}</span>
            </div>
        </div>
    );
}

function GoalUpdateForm({ currentGoal }: { currentGoal: number }) {
    const { data, setData, patch, processing, errors } = useForm({
        weekly_goal: String(currentGoal),
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(goals.update.url());
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="size-4" />
                        Weekly Target
                    </CardTitle>
                    <CardDescription>Set your weekly application goal.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="weekly_goal">Applications per week</Label>
                        <div className="flex gap-2">
                            <Input
                                id="weekly_goal"
                                type="number"
                                min={1}
                                max={100}
                                value={data.weekly_goal}
                                onChange={(e) => setData('weekly_goal', e.target.value)}
                                aria-invalid={!!errors.weekly_goal}
                                className="max-w-28"
                            />
                            <Button type="submit" disabled={processing || data.weekly_goal === String(currentGoal)}>
                                <Save className="size-4" />
                                {processing ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                        {errors.weekly_goal && (
                            <p className="text-xs text-destructive">{errors.weekly_goal}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}

function BenchmarkTip({ fourWeekAverage, weeklyGoal }: { fourWeekAverage: number; weeklyGoal: number }) {
    let tip: string;

    if (fourWeekAverage === 0) {
        tip = 'Start applying to see your baseline benchmark.';
    } else if (fourWeekAverage >= weeklyGoal) {
        tip = 'Great momentum! Your 4-week average exceeds your goal.';
    } else if (fourWeekAverage >= weeklyGoal * 0.75) {
        tip = 'Nearly there! A couple more applications per week will get you to your goal.';
    } else {
        tip = 'Consider adjusting your goal or increasing your application pace.';
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="size-4" />
                    4-Week Baseline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold text-foreground">{fourWeekAverage}</p>
                <p className="text-xs text-muted-foreground">Avg Applications Per Week</p>
                <p className="mt-2 text-sm text-muted-foreground">{tip}</p>
            </CardContent>
        </Card>
    );
}

function WeeklyHistory({ history }: { history: WeeklyHistoryItem[] }) {
    const maxCount = Math.max(...history.map((h) => h.count), 1);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="size-4" />
                    Weekly Breakdown
                </CardTitle>
                <CardDescription>Your application activity over the last 4 weeks.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-end gap-3">
                    {history.map((week) => (
                        <div key={week.start_date} className="flex flex-1 flex-col items-center gap-1.5">
                            <span className="text-xs font-medium text-foreground">{week.count}</span>
                            <div
                                className={`w-full rounded-sm transition-all duration-500 ${
                                    week.is_current ? 'bg-primary' : 'bg-primary/40'
                                }`}
                                style={{
                                    height: week.count > 0
                                        ? `${Math.max((week.count / maxCount) * 80, 8)}px`
                                        : '8px',
                                }}
                            />
                            <span className="text-[10px] text-muted-foreground">{week.label}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function GoalsIndex({
    weekly_goal,
    current_streak,
    weekly_progress,
    four_week_average,
    weekly_history,
}: GoalsPageProps) {
    return (
        <>
            <Head title="Goals" />

            <div className="flex flex-1 min-h-0 flex-col gap-6 overflow-y-auto pr-2 pb-4">
                <PageHeader title="Weekly Goals" description="Track your application consistency and keep your momentum going." />

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="size-4" />
                                    This Week
                                </CardTitle>
                                <StreakBadge streak={current_streak} />
                            </div>
                            <CardDescription>
                                {weekly_progress >= weekly_goal
                                    ? 'Goal completed for this week!'
                                    : `${weekly_goal - weekly_progress} more to reach your goal`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center sm:justify-around">
                            <ProgressRing progress={weekly_progress} goal={weekly_goal} />
                        </CardContent>
                    </Card>

                    <GoalUpdateForm currentGoal={weekly_goal} />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <WeeklyHistory history={weekly_history} />
                    </div>
                    <BenchmarkTip fourWeekAverage={four_week_average} weeklyGoal={weekly_goal} />
                </div>
            </div>
        </>
    );
}

GoalsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
