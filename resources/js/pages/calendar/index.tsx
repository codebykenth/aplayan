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

    const [loadingAppId, setLoadingAppId] = useState<number | null>(null);

    const openApplicationDetailById = async (applicationId: number) => {
        setLoadingAppId(applicationId);

        try {
            const response = await fetch(`/job-applications/${applicationId}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const json = await response.json();
                setViewingApplication(json.data);
            }
        } catch {
            // handle error silently
        } finally {
            setLoadingAppId(null);
        }
    };

    const weekDays = view === 'week' && events.length > 0
        ? getWeekDays(currentYear, currentMonth, events[0].date ? parseInt(events[0].date_display) : 1)
        : [];

    const weeks = view === 'month' ? getWeeksInMonth(currentYear, currentMonth) : [];

    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const selectedDayEvents = useMemo(() => {
        if (!selectedDate) return [];
        return eventsByDate.get(selectedDate) ?? [];
    }, [selectedDate, eventsByDate]);

    return (
        <>
            <Head title="Calendar" />

            <div className="flex flex-1 min-h-0 flex-col gap-6 overflow-y-auto">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={prevMonth}>
                            <ChevronLeftIcon className="size-4" />
                        </Button>
                        <span className="min-w-[140px] text-center text-sm sm:text-base font-semibold text-foreground">
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

                <Card className="glass-card overflow-hidden">
                    <CardContent className="p-2 sm:p-4">
                        {view === 'month' ? (
                            <div className="grid grid-cols-7 gap-1">
                                {DAY_NAMES.map((day) => (
                                    <div
                                        key={day}
                                        className="text-center text-[11px] sm:text-xs font-semibold text-muted-foreground py-1"
                                    >
                                        <span className="sm:hidden">{day[0]}</span>
                                        <span className="hidden sm:inline">{day}</span>
                                    </div>
                                ))}
                                {weeks.map((week, weekIndex) => (
                                    week.map((day, dayIndex) => {
                                        const dateStr = day
                                            ? `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                            : '';
                                        const dayEvents = day ? eventsByDate.get(dateStr) : [];
                                        const isSelected = selectedDate === dateStr;
                                        const hasEvents = dayEvents && dayEvents.length > 0;

                                        return (
                                            <div
                                                key={`${weekIndex}-${dayIndex}`}
                                                className={`min-h-[50px] sm:min-h-[85px] rounded-lg border p-1 sm:p-2 transition-all flex flex-col justify-between ${
                                                    day
                                                        ? isSelected
                                                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                                            : 'bg-card hover:bg-muted/50 cursor-pointer'
                                                        : 'bg-transparent border-transparent opacity-0 pointer-events-none'
                                                }`}
                                                onClick={() => {
                                                    if (day) {
                                                        setSelectedDate(dateStr);
                                                        if (dayEvents && dayEvents.length > 0 && window.innerWidth >= 640) {
                                                            openApplicationDetailById(dayEvents[0].id);
                                                        }
                                                    }
                                                }}
                                            >
                                                {day ? (
                                                    <>
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-primary font-bold' : 'text-foreground'}`}>
                                                                {day}
                                                            </span>
                                                            {hasEvents && (
                                                                <span className="sm:hidden flex size-2 rounded-full bg-primary" />
                                                            )}
                                                        </div>

                                                        {/* Mobile Dots */}
                                                        {hasEvents && (
                                                            <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden justify-center">
                                                                {dayEvents.map((event, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className={`size-1.5 rounded-full ${
                                                                            event.status === 'interviewing'
                                                                                ? 'bg-amber-500'
                                                                                : event.status === 'offer'
                                                                                  ? 'bg-green-500'
                                                                                  : event.status === 'applied'
                                                                                    ? 'bg-blue-500'
                                                                                    : 'bg-slate-400'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Desktop Badges */}
                                                        <div className="mt-1 hidden sm:flex flex-col gap-1">
                                                            {dayEvents?.map((event) => (
                                                                <div
                                                                    key={`${event.id}-${event.type}`}
                                                                    className="cursor-pointer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openApplicationDetailById(event.id);
                                                                    }}
                                                                >
                                                                    <Badge
                                                                        className={`${STATUS_COLORS[event.status as keyof typeof STATUS_COLORS] ?? 'bg-gray-100 text-gray-700'} cursor-pointer text-[10px] capitalize truncate max-w-full`}
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
                                            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors"
                                        >
                                            <span className="w-full sm:w-24 text-xs sm:text-sm font-semibold text-foreground shrink-0">
                                                {label}
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {dayEvents && dayEvents.length > 0 ? (
                                                    dayEvents.map((event) => (
                                                        <Badge
                                                            key={`${event.id}-${event.type}`}
                                                            className={`${STATUS_COLORS[event.status as keyof typeof STATUS_COLORS] ?? 'bg-gray-100 text-gray-700'} cursor-pointer capitalize text-xs`}
                                                            onClick={() => openApplicationDetailById(event.id)}
                                                        >
                                                            {event.label}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No events</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Selected Date Agenda (Mobile & Quick Detail) */}
                {selectedDate && (
                    <Card className="glass-card">
                        <CardContent className="p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Events for {new Date(selectedDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </h3>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setSelectedDate(null)}>
                                    Clear
                                </Button>
                            </div>

                            {selectedDayEvents.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {selectedDayEvents.map((event) => (
                                        <div
                                            key={`${event.id}-${event.type}`}
                                            onClick={() => openApplicationDetailById(event.id)}
                                            className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {event.job_title}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {event.company_name}
                                                </span>
                                            </div>
                                            <Badge className={`${STATUS_COLORS[event.status as keyof typeof STATUS_COLORS]} capitalize text-xs`}>
                                                {event.label}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">
                                    No events scheduled for this day.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
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