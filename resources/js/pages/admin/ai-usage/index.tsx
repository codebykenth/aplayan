import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Cpu,
    DollarSign,
    Database,
    Shield,
    ShieldOff,
    Brain,
    BarChart3,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface ModelUsage {
    model: string;
    total_calls: number;
    total_tokens: number;
}

interface PageProps extends InertiaPageProps {
    kpi: Kpi;
    daily_token_usage: DailyUsage[];
    top_features: TopFeature[];
    top_consumers: TopConsumer[];
    models_used?: ModelUsage[];
    active_model?: string;
}

function formatNumber(n: number): string {
    if (n >= 1_000_000) {
        return `${(n / 1_000_000).toFixed(1)}M`;
    }

    if (n >= 1_000) {
        return `${(n / 1_000).toFixed(1)}K`;
    }

    return n.toLocaleString();
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
    }).format(amount);
}

function ConsumerRow({ consumer }: { consumer: TopConsumer }) {
    const [updating, setUpdating] = useState(false);

    function toggleAiDisabled() {
        setUpdating(true);
        router.patch(
            `/admin/users/${consumer.id}/ai-status`,
            { is_ai_disabled: !consumer.is_ai_disabled },
            {
                preserveScroll: true,
                onFinish: () => setUpdating(false),
            },
        );
    }

    return (
        <tr className="border-b border-border/50 hover:bg-muted/50">
            <td className="py-3 pr-4 pl-2">
                <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {consumer.name.charAt(0).toUpperCase()}
                    </div>
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
            <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                {consumer.total_calls}
            </td>
            <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                {formatNumber(consumer.total_tokens)}
            </td>
            <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                {formatCurrency(consumer.estimated_cost)}
            </td>
            <td className="py-3 pr-2 pl-4 text-right">
                <Button
                    size="sm"
                    variant={
                        consumer.is_ai_disabled ? 'destructive' : 'outline'
                    }
                    disabled={updating}
                    onClick={toggleAiDisabled}
                    className="h-7 gap-1 text-xs"
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
    const {
        kpi,
        daily_token_usage,
        top_features,
        top_consumers,
        models_used,
        active_model,
    } = usePage<PageProps>().props;

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
                >
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="gap-1.5 font-mono text-xs"
                        >
                            <Brain className="size-3.5 text-purple-500" />
                            Model: {active_model ?? 'gemini-3.6-flash'}
                        </Badge>
                    </div>
                </PageHeader>

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
                                                        {formatNumber(
                                                            feature.total_tokens,
                                                        )}{' '}
                                                        tokens
                                                    </p>
                                                </div>
                                                <span className="text-sm font-medium text-foreground">
                                                    {feature.calls}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}

                            <div className="mt-6 space-y-2 border-t border-border pt-4">
                                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    AI Models Invoked
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(models_used && models_used.length > 0
                                        ? models_used
                                        : [
                                              {
                                                  model:
                                                      active_model ??
                                                      'gemini-3.6-flash',
                                                  total_calls: kpi.calls_today,
                                                  total_tokens:
                                                      kpi.token_volume_30d,
                                              },
                                          ]
                                    ).map((m) => (
                                        <Badge
                                            key={m.model}
                                            variant="secondary"
                                            className="gap-1.5 py-1 font-mono text-xs"
                                        >
                                            <Brain className="size-3 text-purple-500" />
                                            {m.model} ({m.total_calls} calls ·{' '}
                                            {formatNumber(m.total_tokens)}{' '}
                                            tokens)
                                        </Badge>
                                    ))}
                                </div>
                            </div>
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
                                            <th className="pr-3 pb-2 font-medium">
                                                User
                                            </th>
                                            <th className="pr-3 pb-2 text-right font-medium">
                                                Calls
                                            </th>
                                            <th className="pr-3 pb-2 text-right font-medium">
                                                Tokens
                                            </th>
                                            <th className="pr-3 pb-2 text-right font-medium">
                                                Cost
                                            </th>
                                            <th className="pb-2 text-right font-medium">
                                                AI Access
                                            </th>
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
