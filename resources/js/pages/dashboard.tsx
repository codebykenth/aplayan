import { Head } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import type { ReactNode } from 'react';
import { Briefcase, TrendingUp, CalendarDays } from 'lucide-react';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JOB_APPLICATION_STATUSES } from '@/types/job-application';
import type { JobApplicationStatus } from '@/types/job-application';
import AppLayout from '@/layouts/app-layout';

const STATUS_CHART_COLORS: Record<JobApplicationStatus, string> = {
    wishlist: 'var(--color-wishlist)',
    applied: 'var(--color-applied)',
    interviewing: 'var(--color-interviewing)',
    offer: 'var(--color-offer)',
    rejected: 'var(--color-rejected)',
};

function statusLabel(value: string): string {
    return JOB_APPLICATION_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export default function Dashboard({
    total,
    status_counts,
    avg_match_score,
    added_this_week,
    added_this_month,
    trend,
}: {
    total: number;
    status_counts: Record<string, number>;
    avg_match_score: number | null;
    added_this_week: number;
    added_this_month: number;
    trend: { date: string; count: number }[];
}) {
    const statusData = Object.entries(status_counts).map(([key, value]) => ({
        status: key,
        count: value,
        fill: STATUS_CHART_COLORS[key as JobApplicationStatus],
    }));

    const pieConfig: ChartConfig = {};
    for (const { value } of JOB_APPLICATION_STATUSES) {
        pieConfig[value] = {
            label: statusLabel(value),
            color: STATUS_CHART_COLORS[value],
        };
    }

    const barConfig: ChartConfig = {
        count: {
            label: 'Applications',
            color: 'var(--color-count)',
        },
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Overview of your job search activity
                    </p>
                </div>

                {/* Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Briefcase className="size-4" />
                                Total Applications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {total}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <TrendingUp className="size-4" />
                                Avg Match Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {avg_match_score !== null
                                    ? `${avg_match_score}%`
                                    : '—'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <CalendarDays className="size-4" />
                                Added This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {added_this_month}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {added_this_week} this week
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Status Distribution Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {statusData.length === 0 ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No applications yet
                                </div>
                            ) : (
                                <ChartContainer config={pieConfig} className="aspect-square max-h-72">
                                    <PieChart>
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    nameKey="status"
                                                    labelKey="status"
                                                />
                                            }
                                        />
                                        <Pie
                                            data={statusData}
                                            dataKey="count"
                                            nameKey="status"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                        >
                                            {statusData.map((entry) => (
                                                <Cell key={entry.status} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* 30-Day Trend Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>30-Day Application Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {trend.length === 0 ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No data yet
                                </div>
                            ) : (
                                <ChartContainer config={barConfig} className="aspect-square max-h-72">
                                    <BarChart data={trend}>
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val: string) => {
                                                const d = new Date(val + 'T00:00:00');
                                                return `${d.getMonth() + 1}/${d.getDate()}`;
                                            }}
                                            fontSize={10}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                            fontSize={10}
                                        />
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(label) => {
                                                        const d = new Date(
                                                            String(label) + 'T00:00:00'
                                                        );
                                                        return d.toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        });
                                                    }}
                                                />
                                            }
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="var(--color-count)"
                                            radius={[3, 3, 0, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;