import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Cpu, TrendingUp, Users, CalendarDays } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { PageHeader } from '@/components/ui/page-header';
import AdminLayout from '@/layouts/admin-layout';

export default function AdminAiUsage({
    daily_usage = [],
    top_features = [],
    total_calls_last_30_days = 0,
    total_calls_today = 0,
}: {
    daily_usage?: { date: string; count: number }[];
    top_features?: { feature_type: string; count: number }[];
    total_calls_last_30_days?: number;
    total_calls_today?: number;
}) {
    const barConfig: ChartConfig = {
        count: {
            label: 'API Calls',
            color: '#8b5cf6',
        },
    };

    return (
        <>
            <Head title="AI Usage Monitor" />

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2 pb-4">
                <PageHeader
                    title="AI Usage Monitor"
                    description="Track AI API consumption across the platform"
                />

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Cpu className="size-4" />
                                Calls Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {total_calls_today}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <CalendarDays className="size-4" />
                                Last 30 Days
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {total_calls_last_30_days}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <TrendingUp className="size-4" />
                                Features Used
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {top_features.length}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Active features in last 30 days
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily API Usage (30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {daily_usage.length === 0 ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No data yet
                                </div>
                            ) : (
                                <ChartContainer
                                    config={barConfig}
                                    className="h-72 w-full"
                                >
                                    <BarChart data={daily_usage}>
                                        <CartesianGrid
                                            vertical={false}
                                            strokeDasharray="3 3"
                                            stroke="hsl(var(--border))"
                                        />
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
                                            width={30}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
                                        <ChartLegend
                                            content={<ChartLegendContent />}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="#8b5cf6"
                                            radius={[3, 3, 0, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Features Used (30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {top_features.length === 0 ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No usage data yet
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {top_features.map((feature, index) => (
                                        <div
                                            key={feature.feature_type}
                                            className="flex items-center gap-3"
                                        >
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {feature.feature_type.replace(/_/g, ' ')}
                                                </p>
                                            </div>
                                            <span className="text-sm font-medium text-foreground">
                                                {feature.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminAiUsage.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
