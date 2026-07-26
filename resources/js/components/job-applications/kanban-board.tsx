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
            className={`flex w-72 shrink-0 flex-col gap-3 rounded-xl border bg-card p-3 transition-shadow ${
                isOver
                    ? 'border-primary shadow-lg shadow-primary/10'
                    : 'border-border'
            }`}
        >
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-card-foreground">
                    {label}
                </h3>
                <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
                >
                    {applications.length}
                </span>
            </div>

            <div className="flex flex-col gap-2">
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
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={isDragging ? 'opacity-30' : ''}
        >
            <JobApplicationCard
                application={application}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
}

function KanbanCardOverlay({ application }: { application: JobApplication }) {
    return (
        <div className="rotate-3 opacity-90">
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xl">
                <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="truncate text-sm font-semibold text-card-foreground">
                        {application.job_title}
                    </h3>
                    <p className="truncate text-sm text-muted-foreground">
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

    useEffect(() => {
        setLocalApplications(applications);
    }, [applications]);

    const grouped = useMemo(() => {
        const map = Object.fromEntries(
            JOB_APPLICATION_STATUSES.map((s) => [s.value, [] as JobApplication[]]),
        ) as Record<JobApplicationStatus, JobApplication[]>;

        for (const app of localApplications) {
            if (app.status in map) {
                map[app.status].push(app);
            }
        }

        return map;
    }, [localApplications]);

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
            <div className="flex gap-4 overflow-x-auto pb-4">
                {JOB_APPLICATION_STATUSES.map(({ value, label }) => (
                    <Column
                        key={value}
                        status={value}
                        label={label}
                        applications={grouped[value]}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
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