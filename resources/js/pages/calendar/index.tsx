import { Head, router } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon, GridIcon, ListIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import ApplicationDetailModal from '@/components/job-applications/application-detail-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { STATUS_COLORS } from '@/types/job-application';
import type { JobApplication } from '@/types/job-application';

interface CalendarEvent {
    id: number;
    type: 'interview' | 'application' | 'follow_up';
    date: string;
    date_display: string;
    status: string;
    company_name: string;
    job_title: string;
    label: string;
}

function formatMonthYear(year: number, month: number): string {
    return new Date(year, month - 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month - 1, 1).getDay();
}

function getWeeksInMonth(year: number, month: number): number[][] {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const weeks: number[][] = [];
    let week: number[] = [];

    for (let i = 0; i < firstDay; i++) {
        week.push(0);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        week.push(day);

        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }

    if (week.length > 0) {
        while (week.length < 7) {
            week.push(0);
        }

        weeks.push(week);
    }

    return weeks;
}

function getWeekDays(year: number, month: number, day: number): { date: string; label: string }[] {
    const date = new Date(year, month - 1, day);
    const days: { date: string; label: string }[] = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push({
            date: d.toISOString().split('T')[0],
            label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        });
    }

    return days;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar({
    events,
    month,
    year,
}: {
    events: CalendarEvent[];
    month: number;
    year: number;
}) {
    const [view, setView] = useState<'month' | 'week'>('month');
    const [viewingApplication, setViewingApplication] = useState<JobApplication | null>(null);
    const [currentMonth, setCurrentMonth] = useState(month);
    const [currentYear, setCurrentYear] = useState(year);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();

        for (const event of events) {
            const key = event.date_display;

            if (!map.has(key)) {
                map.set(key, []);
            }

            map.get(key)!.push(event);
        }

        return map;
    }, [events]);

    const prevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const navigateToApplication = (applicationId: number) => {
        router.visit(`/job-applications/${applicationId}`, {
            preserveState: true,
        });
    };

    const openApplicationDetail = (app: JobApplication) => {
        setViewingApplication(app);
    };

    const weekDays = view === 'week' && events.length > 0
        ? getWeekDays(currentYear, currentMonth, events[0].date ? parseInt(events[0].date_display) : 1)
        : [];

    const weeks = view === 'month' ? getWeeksInMonth(currentYear, currentMonth) : [];

    return (
        <>
            <Head title="Calendar" />

            <div className="flex flex-1 min-h-0 flex-col gap-6 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={prevMonth}>
                            <ChevronLeftIcon className="size-4" />
                        </Button>
                        <span className="min-w-[160px] text-center text-lg font-medium text-foreground">
                            {formatMonthYear(currentYear, currentMonth)}
                        </span>
                        <Button variant="outline" size="sm" onClick={nextMonth}>
                            <ChevronRightIcon className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={view === 'month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView('month')}
                    >
                        <GridIcon className="size-4" />
                        Month
                    </Button>
                    <Button
                        variant={view === 'week' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView('week')}
                    >
                        <ListIcon className="size-4" />
                        Week
                    </Button>
                </div>

                <Card className="glass-card">
                    <CardContent className="p-4">
                        {view === 'month' ? (
                            <div className="grid grid-cols-7 gap-1">
                                {DAY_NAMES.map((day) => (
                                    <div
                                        key={day}
                                        className="text-center text-xs font-medium text-muted-foreground py-2"
                                    >
                                        {day}
                                    </div>
                                ))}
                                {weeks.map((week, weekIndex) => (
                                    week.map((day, dayIndex) => {
                                        const dateStr = day
                                            ? `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                            : '';
                                        const dayEvents = day ? eventsByDate.get(dateStr) : [];

                                        return (
                                            <div
                                                key={`${weekIndex}-${dayIndex}`}
                                                className={`min-h-[80px] rounded-lg border p-2 transition-colors ${
                                                    day
                                                        ? 'bg-card hover:bg-muted/50 cursor-pointer'
                                                        : 'bg-transparent border-transparent'
                                                }`}
                                                onClick={() => {
                                                    if (day && dayEvents && dayEvents.length > 0) {
                                                        openApplicationDetail(dayEvents[0] as unknown as JobApplication);
                                                    }
                                                }}
                                            >
                                                {day ? (
                                                    <>
                                                        <span className="text-sm font-medium text-foreground">
                                                            {day}
                                                        </span>
                                                        <div className="mt-1 flex flex-col gap-1">
                                                            {dayEvents?.map((event) => (
                                                                <div
                                                                    key={`${event.id}-${event.type}`}
                                                                    className="cursor-pointer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigateToApplication(event.id);
                                                                    }}
                                                                >
                                                                    <Badge
                                                                        className={`${STATUS_COLORS[event.status as keyof typeof STATUS_COLORS] ?? 'bg-gray-100 text-gray-700'} cursor-pointer text-[10px] capitalize`}
                                                                    >
                                                                        {event.label}
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : null}
                                            </div>
                                        );
                                    })
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {weekDays.map(({ date, label }) => {
                                    const dayEvents = eventsByDate.get(date);

                                    return (
                                        <div
                                            key={date}
                                            className="flex items-center gap-4 rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors"
                                        >
                                            <span className="w-24 text-sm font-medium text-foreground shrink-0">
                                                {label}
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {dayEvents && dayEvents.length > 0 ? (
                                                    dayEvents.map((event) => (
                                                        <Badge
                                                            key={`${event.id}-${event.type}`}
                                                            className={`${STATUS_COLORS[event.status as keyof typeof STATUS_COLORS] ?? 'bg-gray-100 text-gray-700'} cursor-pointer capitalize`}
                                                            onClick={() => navigateToApplication(event.id)}
                                                        >
                                                            {event.label}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">No events</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {events.length === 0 && (
                    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                        No calendar events for this period
                    </div>
                )}
            </div>

            <ApplicationDetailModal
                open={viewingApplication !== null}
                onClose={() => setViewingApplication(null)}
                application={viewingApplication}
            />
        </>
    );
}

Calendar.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;