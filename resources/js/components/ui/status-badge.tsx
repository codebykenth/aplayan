import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/types/job-application';
import type { JobApplicationStatus } from '@/types/job-application';
import { JOB_APPLICATION_STATUSES } from '@/types/job-application';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: JobApplicationStatus;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const statusLabel: Partial<Record<JobApplicationStatus, string>> = {};
for (const s of JOB_APPLICATION_STATUSES) {
  statusLabel[s.value] = s.label;
}

function StatusBadge({ status, className, onClick }: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        'border-0 shrink-0 capitalize',
        STATUS_COLORS[status],
        className,
      )}
      onClick={onClick}
    >
      {statusLabel[status] ?? status}
    </Badge>
  );
}

export { StatusBadge };