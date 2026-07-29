import { Head } from '@inertiajs/react';
import { InfoIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    AreaChart,
    Area,
    CartesianGrid,
    Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { PageHeader } from '@/components/ui/page-header';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { JOB_APPLICATION_STATUSES } from '@/types/job-application';
import type { JobApplicationStatus } from '@/types/job-application';
import { formatSalary } from '@/utils/currency';

const STATUS_CHART_COLORS: Record<JobApplicationStatus, string> = {
    wishlist: '#94a3b8',
    applied: '#3b82f6',
    interviewing: '#f59e0b',
    offer: '#10b981',
    rejected: '#ef4444',
    withdrawn: '#64748b',
};

const FUNNEL_COLORS = ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

const RESPONSE_COLORS = ['#15803d', '#22c55e', '#eab308', '#f97316', '#ef4444'];

function ChartInfoTooltip({ description }: { description: string }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger
                    render={
                        <button
                            type="button"
                            className="rounded-sm p-0.5 text-muted-foreground/70 transition-colors hover:text-foreground focus:ring-1 focus:ring-ring focus:outline-hidden"
                            aria-label="Chart information"
                        >
                            <InfoIcon className="size-4" />
                        </button>
                    }
                />
                <TooltipContent
                    side="top"
                    className="max-w-64 text-xs font-normal"
                >
                    {description}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function statusLabel(value: string): string {
    return (
        JOB_APPLICATION_STATUSES.find((s) => s.value === value)?.label ?? value
    );
}

function responseColor(days: number): string {
    if (days <= 7) {
        return RESPONSE_COLORS[0];
    }

    if (days <= 14) {
        return RESPONSE_COLORS[1];
    }

    if (days <= 30) {
        return RESPONSE_COLORS[2];
    }

    if (days <= 60) {
        return RESPONSE_COLORS[3];
    }

    return RESPONSE_COLORS[4];
}

function weekLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');

    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function weekTooltipLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');

    return `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

interface FunnelItem {
    name: string;
    value: number;
}

interface WeeklyVolumeItem {
    week: string;
    count: number;
}

interface StatusOverTimeItem {
    week: string;
    [key: string]: string | number;
}

interface SalaryInsights {
    avg_expected: number | null;
    avg_offered: number | null;
    base_currency?: string;
}

interface SalaryBandItem {
    band: string;
    expected: number;
    offered: number;
}

interface TimeToResponseItem {
    company: string;
    job_title: string;
    days: number;
    applied_date: string;
    first_response_date: string;
    last_contact_date: string | null;
    last_contact_days: number | null;
}

export default function Analytics({
    funnel = [],
    weekly_volume = [],
    status_over_time = [],
    salary_insights = { avg_expected: null, avg_offered: null },
    salary_bands = [],
    time_to_response = [],
}: {
    funnel?: FunnelItem[];
    weekly_volume?: WeeklyVolumeItem[];
    status_over_time?: StatusOverTimeItem[];
    salary_insights?: SalaryInsights;
    salary_bands?: SalaryBandItem[];
    time_to_response?: TimeToResponseItem[];
}) {
    const baseCurrency = salary_insights?.base_currency || 'PHP';

    const funnelConfig: ChartConfig = {};

    for (const item of funnel) {
        funnelConfig[item.name] = {
            label: item.name,
            color: FUNNEL_COLORS[funnel.indexOf(item)],
        };
    }

    const weeklyConfig: ChartConfig = {
        count: { label: 'Applications', color: '#6366f1' }, // indigo-500
    };

    const statusOverTimeConfig: ChartConfig = {};

    for (const { value } of JOB_APPLICATION_STATUSES) {
        statusOverTimeConfig[value] = {
            label: statusLabel(value),
            color: STATUS_CHART_COLORS[value],
        };
    }

    const salaryBandsConfig: ChartConfig = {
        expected: { label: 'Expected', color: '#f59e0b' }, // amber-500
        offered: { label: 'Offered', color: '#10b981' }, // emerald-500
    };

    const responseConfig: ChartConfig = {};

    for (const item of time_to_response) {
        const color = responseColor(item.days);
        responseConfig[item.company] = { label: item.company, color };
    }

    const hasWeeklyData =
        weekly_volume.length > 0 && weekly_volume.some((w) => w.count > 0);
    const hasStatusOverTime =
        status_over_time.length > 0 &&
        status_over_time.some((w) =>
            JOB_APPLICATION_STATUSES.some((s) => Number(w[s.value]) > 0),
        );
    const hasSalaryBands =
        salary_bands.length > 0 &&
        salary_bands.some((b) => b.expected > 0 || b.offered > 0);

    return (
        <>
            <Head title="Analytics" />

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2 pb-4">
                <PageHeader
                    title="Analytics"
                    description="Deep-dive metrics on your job search pipeline"
                />

                {/* Salary Insights Summary */}
                <div className="grid shrink-0 gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Avg Expected Salary ({baseCurrency})
                            </CardTitle>
                            <ChartInfoTooltip description="Calculated as the average expected salary across all job applications, converted into your preferred base currency." />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {salary_insights.avg_expected !== null
                                    ? formatSalary(
                                          salary_insights.avg_expected,
                                          baseCurrency,
                                      )
                                    : '—'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Avg Offered Salary ({baseCurrency})
                            </CardTitle>
                            <ChartInfoTooltip description="Calculated as the average offered salary across all job applications that reached the offer stage, converted into your preferred base currency." />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {salary_insights.avg_offered !== null
                                    ? formatSalary(
                                          salary_insights.avg_offered,
                                          baseCurrency,
                                      )
                                    : '—'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Chart Grid */}
                <div className="grid shrink-0 gap-6 md:grid-cols-2">
                    {/* 1. Application Funnel */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Application Funnel</CardTitle>
                            <ChartInfoTooltip description="Shows total applications grouped by stage (Wishlist, Applied, Interviewing, Offer). Excludes rejected applications." />
                        </CardHeader>
                        <CardContent>
                            {funnel.length === 0 ||
                            funnel.every((f) => f.value === 0) ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No applications yet
                                </div>
                            ) : (
                                <>
                                    <ChartContainer
                                        config={funnelConfig}
                                        className="min-h-[300px] w-full"
                                    >
                                        <BarChart
                                            data={funnel.map((item, index) => ({
                                                ...item,
                                                fill: FUNNEL_COLORS[index],
                                            }))}
                                            layout="vertical"
                                            margin={{ left: 0, right: 20 }}
                                        >
                                            <CartesianGrid
                                                horizontal={false}
                                                strokeDasharray="3 3"
                                                stroke="hsl(var(--border))"
                                            />
                                            <XAxis
                                                type="number"
                                                tickLine={false}
                                                axisLine={false}
                                                allowDecimals={false}
                                                fontSize={10}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={11}
                                                width={80}
                                            />
                                            <ChartTooltip
                                                cursor={{
                                                    fill: 'var(--muted)',
                                                    opacity: 0.2,
                                                }}
                                                content={
                                                    <ChartTooltipContent
                                                        hideLabel
                                                        formatter={(
                                                            value,
                                                            name,
                                                            item,
                                                            index,
                                                            payload,
                                                        ) => {
                                                            const p =
                                                                payload as Record<
                                                                    string,
                                                                    any
                                                                >;

                                                            return (
                                                                <>
                                                                    <div
                                                                        className="h-2.5 w-2.5 shrink-0 rounded-xs"
                                                                        style={{
                                                                            backgroundColor:
                                                                                p.fill,
                                                                        }}
                                                                    />
                                                                    <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                                                                        <span className="text-muted-foreground">
                                                                            {
                                                                                p.name
                                                                            }
                                                                        </span>
                                                                        <span className="font-mono font-medium text-foreground tabular-nums">
                                                                            {
                                                                                value as React.ReactNode
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            );
                                                        }}
                                                    />
                                                }
                                            />
                                            <ChartLegend
                                                content={() => (
                                                    <ChartLegendContent
                                                        payload={funnel.map(
                                                            (item, index) =>
                                                                ({
                                                                    dataKey:
                                                                        item.name,
                                                                    value: item.name,
                                                                    type: 'square',
                                                                    color: FUNNEL_COLORS[
                                                                        index
                                                                    ],
                                                                }) as any,
                                                        )}
                                                    />
                                                )}
                                            />
                                            <Bar
                                                dataKey="value"
                                                radius={[0, 4, 4, 0]}
                                                barSize={32}
                                            >
                                                {funnel.map((_, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={
                                                            FUNNEL_COLORS[index]
                                                        }
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ChartContainer>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* 2. 12-Week Application Volume */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>12-Week Application Volume</CardTitle>
                            <ChartInfoTooltip description="Displays total job applications submitted per week over the last 12 weeks to track search consistency." />
                        </CardHeader>
                        <CardContent>
                            {!hasWeeklyData ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No data yet
                                </div>
                            ) : (
                                <ChartContainer
                                    config={weeklyConfig}
                                    className="min-h-[300px] w-full"
                                >
                                    <BarChart
                                        data={weekly_volume}
                                        margin={{ left: 0, right: 0 }}
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            strokeDasharray="3 3"
                                            stroke="hsl(var(--border))"
                                        />
                                        <XAxis
                                            dataKey="week"
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={weekLabel}
                                            fontSize={10}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                            fontSize={10}
                                            width={30}
                                        />
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(label) =>
                                                        weekTooltipLabel(
                                                            String(label),
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                        <ChartLegend
                                            content={<ChartLegendContent />}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="#6366f1"
                                            radius={[3, 3, 0, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* 3. Status Distribution Over Time */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Status Distribution Over Time</CardTitle>
                            <ChartInfoTooltip description="A stacked timeline showing how your application statuses evolved week-by-week over the past 12 weeks." />
                        </CardHeader>
                        <CardContent>
                            {!hasStatusOverTime ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No data yet
                                </div>
                            ) : (
                                <ChartContainer
                                    config={statusOverTimeConfig}
                                    className="min-h-[300px] w-full"
                                >
                                    <AreaChart
                                        data={status_over_time}
                                        margin={{ left: 0, right: 0 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="hsl(var(--border))"
                                        />
                                        <XAxis
                                            dataKey="week"
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={weekLabel}
                                            fontSize={10}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                            fontSize={10}
                                            width={30}
                                        />
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(label) =>
                                                        weekTooltipLabel(
                                                            String(label),
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                        <ChartLegend
                                            content={<ChartLegendContent />}
                                        />
                                        {JOB_APPLICATION_STATUSES.map(
                                            ({ value }) => (
                                                <Area
                                                    key={value}
                                                    type="monotone"
                                                    dataKey={value}
                                                    stackId="1"
                                                    stroke={
                                                        STATUS_CHART_COLORS[
                                                            value
                                                        ]
                                                    }
                                                    fill={
                                                        STATUS_CHART_COLORS[
                                                            value
                                                        ]
                                                    }
                                                    fillOpacity={0.6}
                                                />
                                            ),
                                        )}
                                    </AreaChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* 4. Salary Band Distribution */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Salary Band Distribution</CardTitle>
                            <ChartInfoTooltip description="Compares expected vs. offered salaries grouped into salary ranges (e.g., ₱0–30k, ₱30–60k, ₱60–90k, ₱90–120k, ₱120k+)." />
                        </CardHeader>
                        <CardContent>
                            {!hasSalaryBands ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No salary data yet
                                </div>
                            ) : (
                                <ChartContainer
                                    config={salaryBandsConfig}
                                    className="min-h-[300px] w-full"
                                >
                                    <BarChart
                                        data={salary_bands}
                                        margin={{ left: 0, right: 0 }}
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            strokeDasharray="3 3"
                                            stroke="hsl(var(--border))"
                                        />
                                        <XAxis
                                            dataKey="band"
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={10}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                            fontSize={10}
                                            width={30}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
                                        <ChartLegend
                                            content={<ChartLegendContent />}
                                        />
                                        <Bar
                                            dataKey="expected"
                                            fill="#f59e0b"
                                            radius={[3, 3, 0, 0]}
                                            barSize={16}
                                        />
                                        <Bar
                                            dataKey="offered"
                                            fill="#10b981"
                                            radius={[3, 3, 0, 0]}
                                            barSize={16}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* 5. Time-to-Response (full width) */}
                <Card className="shrink-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Time to Response</CardTitle>
                        <ChartInfoTooltip description="Main bar shows days from application date to first employer response. Hover over any bar for full date breakdown." />
                    </CardHeader>
                    <CardContent>
                        {time_to_response.length === 0 ? (
                            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                No response data yet
                            </div>
                        ) : (
                            <ChartContainer
                                config={responseConfig}
                                className="min-h-[350px] w-full"
                            >
                                <BarChart
                                    data={time_to_response
                                        .slice(0, 15)
                                        .map((item) => ({
                                            ...item,
                                            fill: responseColor(item.days),
                                        }))}
                                    layout="vertical"
                                    margin={{
                                        left: -10,
                                        right: 30,
                                        bottom: 20,
                                    }}
                                >
                                    <CartesianGrid
                                        horizontal={false}
                                        strokeDasharray="3 3"
                                        stroke="hsl(var(--border))"
                                    />
                                    <XAxis
                                        type="number"
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                        fontSize={10}
                                        label={{
                                            value: 'Days',
                                            position: 'insideBottomRight',
                                            offset: -10,
                                            fontSize: 11,
                                            fill: 'hsl(var(--muted-foreground))',
                                        }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="company"
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={11}
                                        width={90}
                                    />
                                    <ChartTooltip
                                        content={({ active, payload }) => {
                                            if (!active || !payload?.length) {
                                                return null;
                                            }

                                            const item = payload[0]
                                                .payload as TimeToResponseItem;
                                            const dotColor = responseColor(
                                                item.days,
                                            );

                                            return (
                                                <div className="grid min-w-48 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                                                    <div className="border-b border-border/40 pb-1 font-semibold text-foreground">
                                                        {item.company}{' '}
                                                        <span className="font-normal text-muted-foreground">
                                                            — {item.job_title}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4 pt-0.5">
                                                        <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                                                            <div
                                                                className="h-2 w-2 rounded-[2px]"
                                                                style={{
                                                                    backgroundColor:
                                                                        dotColor,
                                                                }}
                                                            />
                                                            First Response:
                                                        </div>
                                                        <span className="font-mono font-medium text-foreground">
                                                            {item.days}{' '}
                                                            {item.days === 1
                                                                ? 'day'
                                                                : 'days'}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-0.5 border-t border-border/20 pt-1 text-[11px] text-muted-foreground">
                                                        <div>
                                                            • Applied:{' '}
                                                            {item.applied_date}
                                                        </div>
                                                        <div>
                                                            • Responded:{' '}
                                                            {
                                                                item.first_response_date
                                                            }
                                                        </div>
                                                        {item.last_contact_date &&
                                                            item.last_contact_days !==
                                                                null && (
                                                                <div className="pt-0.5 font-medium text-primary">
                                                                    • Last
                                                                    Contact:{' '}
                                                                    {
                                                                        item.last_contact_date
                                                                    }{' '}
                                                                    (
                                                                    {
                                                                        item.last_contact_days
                                                                    }
                                                                    d total)
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Bar
                                        dataKey="days"
                                        name="Days"
                                        radius={[0, 4, 4, 0]}
                                        barSize={22}
                                        minPointSize={2}
                                    >
                                        {time_to_response
                                            .slice(0, 15)
                                            .map((item, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={responseColor(
                                                        item.days,
                                                    )}
                                                />
                                            ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Analytics.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
