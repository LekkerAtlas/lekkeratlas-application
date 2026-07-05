import type { QueueJobStatus } from '@/features/progress/progressTypes';
import { getProgressStatusLabel } from '@/features/progress/progressStatus';
import '@/features/progress/progress.css';

export function ProgressStatusBadge({ status }: { status: QueueJobStatus }) {
    return (
        <span
            className={`progress-status-badge progress-status--${status.toLowerCase()}`}
        >
            {getProgressStatusLabel(status)}
        </span>
    );
}

export function ProgressStatusDot({ status }: { status: QueueJobStatus }) {
    return (
        <span
            title={status}
            className={`progress-status-dot progress-status--${status.toLowerCase()}`}
        />
    );
}
