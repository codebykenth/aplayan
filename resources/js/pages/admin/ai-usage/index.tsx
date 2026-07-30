import { Head, router, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import {
    Cpu,
    TrendingUp,
    DollarSign,
    Database,
    Shield,
    ShieldOff,
    ChevronDown,
    ChevronUp,
    Search,
    Brain,
    Zap,
    BarChart3,
    Users,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';

interface Kpi {
    calls_today: number;
    token_volume_30d: number;
    estimated_api_cost_30d: number;
    tokens_saved_via_caching: number;
}

interface DailyUsage {
    date: string;
    calls: number;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

interface TopFeature {
    feature_type: string;
    label: string;
    calls: number;
    total_tokens: number;
}

interface TopConsumer {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    is_ai_disabled: boolean;
    total_calls: number;
    total_tokens: number;
    estimated_cost: number;
}

interface PageProps {
    kpi: Kpi;
    daily_token_usage: DailyUsage[];
    top_features: TopFeature[];
    top_consumers: TopConsumer[];
}

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

function formatCurrency(n: number): string {
    if (n < 0.01) return `$${n.toFixed(4)}`;
    return `$${n.toFixed(2)}`;
}

function Avatar({ name, avatar }: { name: string; avatar?: string | null }) {
    if (avatar) {
        return <img src={avatar} alt="" className="size-7 rounded-full" />;
    }

    return (
        <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

function ConsumerRow({ consumer }: { consumer: TopConsumer }) {
    const [toggling, setToggling] = useState(false);

    function handleToggleAi() {
        setToggling(true);
        router.post(`/admin/users/${consumer.id}/toggle-ai`, {}, {
            preserveScroll: true,
            onFinish: () => setToggling(false),
        });
    }

    return (
        <tr className="border-b border-border last:border-0">
            <td className="py-3 pr-3">
                <div className="flex items-center gap-2">
                    <Avatar name={consumer.name} avatar={consumer.avatar} />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                            {consumer.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {consumer.email}
                        </p>
                    </div>
                </div>
            </td>
            <td className="py-3 pr-3 text-right text-sm tabular-nums text-foreground">
                {consumer.total_calls}
            </td>
            <td className="py-3 pr-3 text-right text-sm tabular-nums text-foreground">
                {formatNumber(consumer.total_tokens)}
            </td>
            <td className="py-3 pr-3 text-right text-sm tabular-nums text-muted-foreground">
                {formatCurrency(consumer.estimated_cost)}
            </td>
            <td className="py-3 text-right">
                <Button
                    variant={consumer.is_ai_disabled ? 'destructive' : 'outline'}
                    size="xs"
                    onClick={handleToggleAi}
                    disabled={toggling}
                    className="gap-1"
                >
                    {consumer.is_ai_disabled ? (
                        <ShieldOff className="size-3" />
                    ) : (
                        <Shield className="size-3" />
                    )}
                    {consumer.is_ai_disabled ? 'Disabled' : 'Enabled'}
                </Button>
            </td>
        </tr>
    );
}

export default function AdminAiUsage() {
    const { kpi, daily_token_usage, top_features, top_consumers } = usePage<PageProps>().props;

    const chartConfig: ChartConfig = {
        prompt_tokens: {
            label: 'Input Tokens',
            color: '#8b5cf6',
        },
        completion_tokens: {
            label: 'Output Tokens',
            color: '#06b6d4',
        },
    };

    const sortedDaily = [...(daily_token_usage ?? [])].reverse();

    return (
        <>
            <Head title="AI Usage Monitor" />

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2 pb-4">
                <PageHeader
                    title="AI Usage Monitor"
                    description="Track AI API consumption, costs, and per-user access controls"
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Cpu className="size-4" />
                                Calls Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {kpi.calls_today}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <BarChart3 className="size-4" />
                                30-Day Token Volume
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {formatNumber(kpi.token_volume_30d)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Total tokens consumed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <DollarSign className="size-4" />
                                Estimated API Cost
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {formatCurrency(kpi.estimated_api_cost_30d)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Last 30 days
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Database className="size-4" />
                                Tokens Saved (Cache)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {formatNumber(kpi.tokens_saved_via_caching)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Estimated via cache hits
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Token Usage (30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {sortedDaily.length === 0 ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No data yet
                                </div>
                            ) : (
                                <ChartContainer
                                    config={chartConfig}
                                    className="h-72 w-full"
                                >
                                    <BarChart data={sortedDaily}>
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
                                            width={40}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
                                        <ChartLegend
                                            content={<ChartLegendContent />}
                                        />
                                        <Bar
                                            dataKey="prompt_tokens"
                                            fill="#8b5cf6"
                                            radius={[3, 3, 0, 0]}
                                            stackId="tokens"
                                        />
                                        <Bar
                                            dataKey="completion_tokens"
                                            fill="#06b6d4"
                                            radius={[3, 3, 0, 0]}
                                            stackId="tokens"
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Features (30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {top_features.length === 0 ? (
                                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                    No usage data yet
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {top_features
                                        .filter((f) => f.calls > 0)
                                        .map((feature, index) => (
                                            <div
                                                key={feature.feature_type}
                                                className="flex items-center gap-3"
                                            >
                                                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                                    {index + 1}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-foreground">
                                                        {feature.label}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatNumber(feature.total_tokens)} tokens
                                                    </p>
                                                </div>
                                                <span className="text-sm font-medium text-foreground">
                                                    {feature.calls}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="size-4" />
                            Top AI Consumers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {top_consumers.length === 0 ? (
                            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                No consumer data yet
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                            <th className="pb-2 pr-3 font-medium">User</th>
                                            <th className="pb-2 pr-3 text-right font-medium">Calls</th>
                                            <th className="pb-2 pr-3 text-right font-medium">Tokens</th>
                                            <th className="pb-2 pr-3 text-right font-medium">Cost</th>
                                            <th className="pb-2 text-right font-medium">AI Access</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {top_consumers.map((consumer) => (
                                            <ConsumerRow
                                                key={consumer.id}
                                                consumer={consumer}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminAiUsage.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
