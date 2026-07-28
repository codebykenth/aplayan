import { Head } from '@inertiajs/react';
import { Briefcase, TrendingUp, CalendarDays, InfoIcon } from 'lucide-react';
import { useState, useCallback  } from 'react';
import type {ReactNode} from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
} from 'recharts';
import ActionFeed from '@/components/action-feed';
import type { ActionItem } from '@/components/action-feed';
import ApplicationDetailModal from '@/components/job-applications/application-detail-modal';
import type { RecentActivityItem } from '@/components/recent-activity-feed';
import RecentActivityFeed from '@/components/recent-activity-feed';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { show as showRoute } from '@/routes/job-applications';
import { JOB_APPLICATION_STATUSES } from '@/types/job-application';
import type { JobApplication } from '@/types/job-application';
import type { JobApplicationStatus } from '@/types/job-application';

const STATUS_CHART_COLORS: Record<JobApplicationStatus, string> = {
    wishlist: '#94a3b8',
    applied: '#3b82f6',
    interviewing: '#f59e0b',
    offer: '#10b981',
    rejected: '#ef4444',
    withdrawn: '#64748b',
};

function ChartInfoTooltip({ description }: { description: string }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger
                    render={
                        <button
                            type="button"
                            className="text-muted-foreground/70 hover:text-foreground transition-colors p-0.5 rounded-sm focus:outline-hidden focus:ring-1 focus:ring-ring"
                            aria-label="Card information"
                        >
                            <InfoIcon className="size-4" />
                        </button>
                    }
                />
                <TooltipContent side="top" className="max-w-64 text-xs font-normal">
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

export default function Dashboard({
    total = 0,
    status_counts = {},
    avg_match_score = null,
    added_this_week = 0,
    added_this_month = 0,
    trend = [],
    action_items = [],
    recent_activities = [],
}: {
    total?: number;
    status_counts?: Record<string, number>;
    avg_match_score?: number | null;
    added_this_week?: number;
    added_this_month?: number;
    trend?: { date: string; count: number }[];
    action_items?: ActionItem[];
    recent_activities?: RecentActivityItem[];
}) {
    const [selectedApplication, setSelectedApplication] =
        useState<JobApplication | null>(null);
    const [isLoadingApplication, setIsLoadingApplication] = useState(false);

    const handleSelectApplication = useCallback(
        async (applicationId: number) => {
            setIsLoadingApplication(true);

            try {
                const response = await fetch(showRoute.url(applicationId), {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
throw new Error('Failed to fetch application');
}

                const json = await response.json();
                setSelectedApplication(json.data as JobApplication);
            } catch {
                window.location.href = showRoute.url(applicationId);
            } finally {
                setIsLoadingApplication(false);
            }
        },
        [],
    );
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
            color: '#6366f1',
        },
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2 pb-4">
                <PageHeader title="Dashboard" description="Overview of your job search activity" />

                {/* Action Feed */}
                <ActionFeed items={action_items} />

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="flex min-w-0 flex-col gap-6">
                        {/* Metric Cards */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Briefcase className="size-4" />
                                        Total Applications
                                    </CardTitle>
                                    <ChartInfoTooltip description="Total count of all job applications tracked across all stages in your pipeline." />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold text-foreground">
                                        {total}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <TrendingUp className="size-4" />
                                        Avg Match Score
                                    </CardTitle>
                                    <ChartInfoTooltip description="Average AI match score rating calculated across applications with match evaluations." />
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
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <CalendarDays className="size-4" />
                                        Added This Month
                                    </CardTitle>
                                    <ChartInfoTooltip description="Number of new job applications created during the current calendar month and week." />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold text-foreground">
                                        {added_this_month}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {added_this_week} this week
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Status Distribution Pie Chart */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Status Distribution</CardTitle>
                                    <ChartInfoTooltip description="Breakdown of your current job applications grouped by status (Wishlist, Applied, Interviewing, Offer, etc.)." />
                                </CardHeader>
                                <CardContent>
                                    {statusData.length === 0 ? (
                                        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                            No applications yet
                                        </div>
                                    ) : (
                                        <ChartContainer
                                            config={pieConfig}
                                            className="h-75 w-full"
                                        >
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
                                                    outerRadius={100}
                                                >
                                                    {statusData.map((entry) => (
                                                        <Cell
                                                            key={entry.status}
                                                            fill={entry.fill}
                                                        />
                                                    ))}
                                                </Pie>
                                                <ChartLegend
                                                    content={
                                                        <ChartLegendContent nameKey="status" />
                                                    }
                                                />
                                            </PieChart>
                                        </ChartContainer>
                                    )}
                                </CardContent>
                            </Card>

                            {/* 30-Day Trend Bar Chart */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>
                                        30-Day Application Trend
                                    </CardTitle>
                                    <ChartInfoTooltip description="Daily application submission counts over the past 30 days to track application momentum." />
                                </CardHeader>
                                <CardContent>
                                    {trend.length === 0 ? (
                                        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                            No data yet
                                        </div>
                                    ) : (
                                        <ChartContainer
                                            config={barConfig}
                                            className="h-75 w-full"
                                        >
                                            <BarChart
                                                data={trend}
                                                margin={{ left: 0, right: 0 }}
                                            >
                                                <CartesianGrid
                                                    vertical={false}
                                                    strokeDasharray="3 3"
                                                    stroke="hsl(var(--border))"
                                                />
                                                <XAxis
                                                    dataKey="date"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(
                                                        val: string,
                                                    ) => {
                                                        const d = new Date(
                                                            val + 'T00:00:00',
                                                        );

                                                        return `${d.getMonth() + 1}/${d.getDate()}`;
                                                    }}
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
                                                            labelFormatter={(
                                                                label,
                                                            ) => {
                                                                const d =
                                                                    new Date(
                                                                        String(
                                                                            label,
                                                                        ) +
                                                                            'T00:00:00',
                                                                    );

                                                                return d.toLocaleDateString(
                                                                    'en-US',
                                                                    {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    },
                                                                );
                                                            }}
                                                        />
                                                    }
                                                />
                                                <ChartLegend
                                                    content={
                                                        <ChartLegendContent />
                                                    }
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
                        </div>
                    </div>

                    {/* Right Sidebar - Recent Activity */}
                    <div className="flex min-h-0 flex-col">
                        <RecentActivityFeed
                            items={recent_activities}
                            onSelectApplication={handleSelectApplication}
                        />
                    </div>
                </div>
            </div>

            <ApplicationDetailModal
                open={selectedApplication !== null || isLoadingApplication}
                onClose={() => setSelectedApplication(null)}
                application={selectedApplication}
                availableContacts={[]}
            />
        </>
    );
}

Dashboard.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
