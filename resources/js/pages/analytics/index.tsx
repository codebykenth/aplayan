import { Head } from '@inertiajs/react';
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
import type { ReactNode } from 'react';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JOB_APPLICATION_STATUSES } from '@/types/job-application';
import type { JobApplicationStatus } from '@/types/job-application';
import AppLayout from '@/layouts/app-layout';

const STATUS_CHART_COLORS: Record<JobApplicationStatus, string> = {
    wishlist: 'hsl(var(--chart-5))',
    applied: 'hsl(var(--chart-2))',
    interviewing: 'hsl(var(--chart-3))',
    offer: 'hsl(var(--chart-1))',
    rejected: 'hsl(0 70% 50%)',
};

const STATUS_TICK_STYLES: Record<string, { fill: string }> = {
    Wishlist: { fill: 'hsl(var(--chart-5))' },
    Applied: { fill: 'hsl(var(--chart-2))' },
    Interviewing: { fill: 'hsl(var(--chart-3))' },
    Offer: { fill: 'hsl(var(--chart-1))' },
};

const FUNNEL_COLORS = [
    'hsl(var(--chart-5))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-1))',
];

const RESPONSE_COLORS = [
    'hsl(142 76% 36%)',
    'hsl(142 71% 45%)',
    'hsl(38 92% 50%)',
    'hsl(25 95% 53%)',
    'hsl(0 72% 51%)',
];

function statusLabel(value: string): string {
    return JOB_APPLICATION_STATUSES.find((s) => s.value === value)?.label ?? value;
}

function responseColor(days: number): string {
    if (days <= 7) return RESPONSE_COLORS[0];
    if (days <= 14) return RESPONSE_COLORS[1];
    if (days <= 30) return RESPONSE_COLORS[2];
    if (days <= 60) return RESPONSE_COLORS[3];
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
}

export default function Analytics({
    funnel,
    weekly_volume,
    status_over_time,
    salary_insights,
    salary_bands,
    time_to_response,
}: {
    funnel: FunnelItem[];
    weekly_volume: WeeklyVolumeItem[];
    status_over_time: StatusOverTimeItem[];
    salary_insights: SalaryInsights;
    salary_bands: SalaryBandItem[];
    time_to_response: TimeToResponseItem[];
}) {
    const funnelConfig: ChartConfig = {};
    for (const item of funnel) {
        funnelConfig[item.name] = {
            label: item.name,
            color: FUNNEL_COLORS[funnel.indexOf(item)],
        };
    }

    const weeklyConfig: ChartConfig = {
        count: { label: 'Applications', color: 'hsl(var(--chart-1))' },
    };

    const statusOverTimeConfig: ChartConfig = {};
    for (const { value } of JOB_APPLICATION_STATUSES) {
        statusOverTimeConfig[value] = {
            label: statusLabel(value),
            color: STATUS_CHART_COLORS[value],
        };
    }

    const salaryBandsConfig: ChartConfig = {
        expected: { label: 'Expected', color: 'hsl(var(--chart-3))' },
        offered: { label: 'Offered', color: 'hsl(var(--chart-1))' },
    };

    const responseConfig: ChartConfig = {};
    for (const item of time_to_response) {
        const color = responseColor(item.days);
        responseConfig[item.company] = { label: item.company, color };
    }

    const hasWeeklyData = weekly_volume.length > 0 && weekly_volume.some((w) => w.count > 0);
    const hasStatusOverTime = status_over_time.length > 0 && status_over_time.some((w) =>
        JOB_APPLICATION_STATUSES.some((s) => Number(w[s.value]) > 0)
    );
    const hasSalaryBands = salary_bands.length > 0 && salary_bands.some((b) => b.expected > 0 || b.offered > 0);

    return (
        <>
            <Head title="Analytics" />

            <div className="flex flex-1 min-h-0 flex-col gap-6 overflow-y-auto pr-2 pb-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Analytics
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Deep-dive metrics on your job search pipeline
                    </p>
                </div>

                {/* Salary Insights Summary */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Avg Expected Salary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-[hsl(var(--chart-3))]">
                                {salary_insights.avg_expected !== null
                                    ? `₱${salary_insights.avg_expected.toLocaleString()}`
                                    : '—'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Avg Offered Salary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-[hsl(var(--chart-1))]">
                                {salary_insights.avg_offered !== null
                                    ? `₱${salary_insights.avg_offered.toLocaleString()}`
                                    : '—'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Chart Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* 1. Application Funnel */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Funnel</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {funnel.length === 0 || funnel.every((f) => f.value === 0) ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No applications yet
                                </div>
                            ) : (
                                <ChartContainer config={funnelConfig} className="h-[300px] w-full">
                                    <BarChart
                                        data={funnel}
                                        layout="vertical"
                                        margin={{ left: 90, right: 20 }}
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
                                            tick={(props) => {
                                                const { x, y, payload } = props;
                                                const style = STATUS_TICK_STYLES[payload.value] ?? {
                                                    fill: 'hsl(var(--foreground))',
                                                };
                                                return (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        dx={-4}
                                                        dy={4}
                                                        textAnchor="end"
                                                        fontSize={11}
                                                        fill={style.fill}
                                                    >
                                                        {payload.value}
                                                    </text>
                                                );
                                            }}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent nameKey="name" />}
                                        />
                                        <Bar
                                            dataKey="value"
                                            radius={[0, 4, 4, 0]}
                                            barSize={32}
                                        >
                                            {funnel.map((_, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={FUNNEL_COLORS[index]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* 2. 12-Week Application Volume */}
                    <Card>
                        <CardHeader>
                            <CardTitle>12-Week Application Volume</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!hasWeeklyData ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No data yet
                                </div>
                            ) : (
                                <ChartContainer config={weeklyConfig} className="h-[300px] w-full">
                                    <BarChart data={weekly_volume} margin={{ left: 0, right: 0 }}>
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
                                        />
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(label) => weekTooltipLabel(String(label))}
                                                />
                                            }
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="hsl(var(--chart-1))"
                                            radius={[3, 3, 0, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* 3. Status Distribution Over Time */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Distribution Over Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!hasStatusOverTime ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No data yet
                                </div>
                            ) : (
                                <ChartContainer config={statusOverTimeConfig} className="h-[300px] w-full">
                                    <AreaChart data={status_over_time} margin={{ left: 0, right: 0 }}>
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
                                        />
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(label) => weekTooltipLabel(String(label))}
                                                />
                                            }
                                        />
                                        <ChartLegend content={<ChartLegendContent />} />
                                        {JOB_APPLICATION_STATUSES.map(({ value }) => (
                                            <Area
                                                key={value}
                                                type="monotone"
                                                dataKey={value}
                                                stackId="1"
                                                stroke={STATUS_CHART_COLORS[value]}
                                                fill={STATUS_CHART_COLORS[value]}
                                                fillOpacity={0.6}
                                            />
                                        ))}
                                    </AreaChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* 4. Salary Band Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Salary Band Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!hasSalaryBands ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No salary data yet
                                </div>
                            ) : (
                                <ChartContainer config={salaryBandsConfig} className="h-[300px] w-full">
                                    <BarChart data={salary_bands} margin={{ left: 0, right: 0 }}>
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
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <ChartLegend content={<ChartLegendContent />} />
                                        <Bar
                                            dataKey="expected"
                                            fill="hsl(var(--chart-3))"
                                            radius={[3, 3, 0, 0]}
                                            barSize={16}
                                        />
                                        <Bar
                                            dataKey="offered"
                                            fill="hsl(var(--chart-1))"
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
                <Card>
                    <CardHeader>
                        <CardTitle>Time to Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {time_to_response.length === 0 ? (
                            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                No response data yet
                            </div>
                        ) : (
                            <ChartContainer config={responseConfig} className="h-[350px] w-full">
                                <BarChart
                                    data={time_to_response.slice(0, 15)}
                                    layout="vertical"
                                    margin={{ left: 140, right: 40, bottom: 20 }}
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
                                        width={130}
                                    />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                labelKey="company"
                                                labelFormatter={(_label, payload) => {
                                                    const item = payload?.[0]?.payload as
                                                        | TimeToResponseItem
                                                        | undefined;
                                                    return item
                                                        ? `${item.company} — ${item.job_title}`
                                                        : '';
                                                }}
                                            />
                                        }
                                    />
                                    <Bar dataKey="days" radius={[0, 4, 4, 0]} barSize={22}>
                                        {time_to_response.slice(0, 15).map((item, index) => (
                                            <Cell key={index} fill={responseColor(item.days)} />
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
