import { Head, router } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon, GridIcon, ListIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import ApplicationDetailModal from '@/components/job-applications/application-detail-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import AppLayout from '@/layouts/app-layout';
import type { JobApplication } from '@/types/job-application';
import type { JobApplicationStatus } from '@/types/job-application';

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
    const [currentDay, setCurrentDay] = useState(1);

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

    const handlePrev = () => {
        if (view === 'month') {
            if (currentMonth === 1) {
                setCurrentMonth(12);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
            setCurrentDay(1);
        } else {
            const date = new Date(currentYear, currentMonth - 1, currentDay - 7);
            setCurrentYear(date.getFullYear());
            setCurrentMonth(date.getMonth() + 1);
            setCurrentDay(date.getDate());
        }
    };

    const handleNext = () => {
        if (view === 'month') {
            if (currentMonth === 12) {
                setCurrentMonth(1);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
            setCurrentDay(1);
        } else {
            const date = new Date(currentYear, currentMonth - 1, currentDay + 7);
            setCurrentYear(date.getFullYear());
            setCurrentMonth(date.getMonth() + 1);
            setCurrentDay(date.getDate());
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

    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const weekDays = useMemo(() => {
        if (view !== 'week') {
            return [];
        }

        return getWeekDays(currentYear, currentMonth, currentDay);
    }, [view, currentYear, currentMonth, currentDay]);

    const activeWeekNumber = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
        return Math.ceil((currentDay + firstDay) / 7);
    }, [currentYear, currentMonth, currentDay]);

    const weeks = view === 'month' ? getWeeksInMonth(currentYear, currentMonth) : [];


    const selectedDayEvents = useMemo(() => {
        if (!selectedDate) {
return [];
}

        return eventsByDate.get(selectedDate) ?? [];
    }, [selectedDate, eventsByDate]);

    return (
        <>
            <Head title="Calendar" />

            <div className="flex flex-1 min-h-0 flex-col gap-6 overflow-y-auto">
                <PageHeader title="Calendar" description="Track upcoming interviews, follow-ups, and application dates">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrev}>
                            <ChevronLeftIcon className="size-4" />
                        </Button>
                        <span className="min-w-[140px] text-center text-sm sm:text-base font-semibold text-foreground">
                            {view === 'week' 
                                ? `Week ${activeWeekNumber} - ${formatMonthYear(currentYear, currentMonth)}`
                                : formatMonthYear(currentYear, currentMonth)}
                        </span>
                        <Button variant="outline" size="sm" onClick={handleNext}>
                            <ChevronRightIcon className="size-4" />
                        </Button>
                    </div>
                </PageHeader>

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

                <Card className="shrink-0 overflow-hidden">
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
                                                        setCurrentDay(day);
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
                                                                    <StatusBadge
                                                                        status={event.status as JobApplicationStatus}
                                                                        className="cursor-pointer text-[10px] truncate max-w-full"
                                                                    />
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
                                            className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                                                selectedDate === date
                                                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                                    : 'bg-card'
                                            }`}
                                            onClick={() => {
                                                setSelectedDate(date);
                                                setCurrentDay(parseInt(date.split('-')[2]));
                                            }}
                                        >
                                            <span className={`w-full sm:w-24 text-xs sm:text-sm font-semibold shrink-0 ${selectedDate === date ? 'text-primary' : 'text-foreground'}`}>
                                                {label}
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {dayEvents && dayEvents.length > 0 ? (
                                                    dayEvents.map((event) => (
                                                        <StatusBadge
                                                            key={`${event.id}-${event.type}`}
                                                            status={event.status as JobApplicationStatus}
                                                            className="cursor-pointer text-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openApplicationDetailById(event.id);
                                                            }}
                                                        />
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
                    <Card className="shrink-0">
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
                                            <div className="flex flex-col gap-0.5 min-w-0 flex-1 mr-4">
                                                <span className="text-sm font-semibold text-foreground truncate">
                                                    {event.job_title}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {event.company_name}
                                                </span>
                                            </div>
                                            <StatusBadge status={event.status as JobApplicationStatus} className="text-xs" />
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