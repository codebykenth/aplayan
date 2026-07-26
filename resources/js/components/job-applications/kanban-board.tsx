import { useMemo, useState, useCallback, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    useDroppable,
    useDraggable,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import { router } from '@inertiajs/react';
import JobApplicationCard from '@/components/job-applications/job-application-card';
import {
    JOB_APPLICATION_STATUSES,
    STATUS_COLORS,
} from '@/types/job-application';
import type { JobApplication, JobApplicationStatus } from '@/types/job-application';
import { status as updateStatus } from '@/routes/job-applications';

const COLUMN_IDS = JOB_APPLICATION_STATUSES.map((s) => s.value);

function Column({
    status,
    label,
    applications,
    onView,
    onEdit,
    onDelete,
}: {
    status: JobApplicationStatus;
    label: string;
    applications: JobApplication[];
    onView: (app: JobApplication) => void;
    onEdit: (app: JobApplication) => void;
    onDelete: (app: JobApplication) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div
            ref={setNodeRef}
            className={`flex h-full max-h-full w-72 shrink-0 flex-col gap-3 rounded-xl border bg-card/70 p-3 backdrop-blur-md transition-shadow max-md:w-full max-md:h-full ${
                isOver
                    ? 'border-primary shadow-lg shadow-primary/10'
                    : 'border-border'
            }`}
        >
            <div className="flex shrink-0 items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-card-foreground">
                    {label}
                </h3>
                <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
                >
                    {applications.length}
                </span>
            </div>

            <div className="flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto pr-1">
                {applications.map((app) => (
                    <DraggableCard
                        key={app.id}
                        application={app}
                        onView={() => onView(app)}
                        onEdit={() => onEdit(app)}
                        onDelete={() => onDelete(app)}
                    />
                ))}
                {applications.length === 0 && (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                        No applications
                    </p>
                )}
            </div>
        </div>
    );
}

function DraggableCard({
    application,
    onView,
    onEdit,
    onDelete,
}: {
    application: JobApplication;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id: application.id.toString(), data: application });

    const style = transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={isDragging ? 'opacity-30' : ''}
        >
            <JobApplicationCard
                application={application}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                dragHandleProps={{ ...listeners, ...attributes }}
            />
        </div>
    );
}

function KanbanCardOverlay({ application }: { application: JobApplication }) {
    return (
        <div className="rotate-3 opacity-90">
            <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card/90 p-3 shadow-xl backdrop-blur-md">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="truncate text-sm font-semibold text-card-foreground">
                        {application.job_title}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">
                        {application.company_name}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function KanbanBoard({
    applications,
    onView,
    onEdit,
    onDelete,
}: {
    applications: JobApplication[];
    onView: (app: JobApplication) => void;
    onEdit: (app: JobApplication) => void;
    onDelete: (app: JobApplication) => void;
}) {
    const [activeApplication, setActiveApplication] =
        useState<JobApplication | null>(null);
    const [localApplications, setLocalApplications] = useState(applications);
    const [activeTab, setActiveTab] = useState<JobApplicationStatus>(
        JOB_APPLICATION_STATUSES[0].value,
    );
    const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

    useEffect(() => {
        setLocalApplications(applications);
    }, [applications]);

    const needsAttention = (app: JobApplication): boolean => {
        return (
            (app.status === 'applied' || app.status === 'interviewing') &&
            (app.staleness_level === 'warning' || app.staleness_level === 'alert')
        );
    };

    const filteredApplications = useMemo(() => {
        if (activeFilter === 'needs-attention') {
            return localApplications.filter(needsAttention);
        }
        return localApplications;
    }, [localApplications, activeFilter]);

    const grouped = useMemo(() => {
        const map = Object.fromEntries(
            JOB_APPLICATION_STATUSES.map((s) => [s.value, [] as JobApplication[]]),
        ) as Record<JobApplicationStatus, JobApplication[]>;

        for (const app of filteredApplications) {
            if (app.status in map) {
                map[app.status].push(app);
            }
        }

            return map;
    }, [filteredApplications]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveApplication(event.active.data.current as JobApplication);
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            setActiveApplication(null);

            const { active, over } = event;

            if (!over) return;

            const app = active.data.current as JobApplication;
            const newStatus = over.id as JobApplicationStatus;

            if (app.status === newStatus) return;

            if (!COLUMN_IDS.includes(newStatus)) return;

            setLocalApplications((prev) =>
                prev.map((a) =>
                    a.id === app.id ? { ...a, status: newStatus } : a,
                ),
            );

            router.patch(
                updateStatus.url(app.id),
                { status: newStatus },
                {
                    preserveState: true,
                    onError: () => {
                        setLocalApplications((prev) =>
                            prev.map((a) =>
                                a.id === app.id
                                    ? { ...a, status: app.status }
                                    : a,
                            ),
                        );
                    },
                },
            );
        },
        [],
    );

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* Mobile Tab Navigation */}
            <div className="mb-4 flex shrink-0 gap-2 overflow-x-auto pb-2 md:hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {JOB_APPLICATION_STATUSES.map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setActiveTab(value)}
                        className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        {label}
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                activeTab === value
                                    ? 'bg-primary-foreground/20 text-primary-foreground'
                                    : STATUS_COLORS[value]
                            }`}
                        >
                            {grouped[value].length}
                        </span>
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => setActiveFilter(
                        activeFilter === 'needs-attention' ? 'all' : 'needs-attention',
                    )}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        activeFilter === 'needs-attention'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                    Needs Attention
                </button>
            </div>

            <div className="flex flex-1 min-h-0 gap-4 overflow-x-auto pb-6 max-md:flex-col max-md:overflow-x-hidden">
                {JOB_APPLICATION_STATUSES.map(({ value, label }) => (
                    <div
                        key={value}
                        className={`h-full max-md:w-full ${
                            activeTab === value
                                ? 'flex flex-1 min-h-0 flex-col max-md:h-full'
                                : 'hidden max-md:hidden'
                        } md:flex md:flex-col`}
                    >
                        <Column
                            status={value}
                            label={label}
                            applications={grouped[value]}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    </div>
                ))}
            </div>

            <DragOverlay>
                {activeApplication && (
                    <KanbanCardOverlay application={activeApplication} />
                )}
            </DragOverlay>
        </DndContext>
    );
}