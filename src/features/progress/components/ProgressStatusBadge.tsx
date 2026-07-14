import type { QueueJobProgressStatus } from '@/features/progress/progressTypes';
import '@/features/progress/progress.css';
import { capitalizeFirstLetter } from '@/lib/formatting/capitalize';

export function ProgressStatusBadge({
    status,
}: Readonly<{ status: QueueJobProgressStatus }>) {
    return (
        <span
            className={`progress-status-badge progress-status--${status.toLowerCase()}`}
        >
            {capitalizeFirstLetter(status.toLowerCase())}
        </span>
    );
}

export function ProgressStatusDot({
    status,
}: Readonly<{ status: QueueJobProgressStatus }>) {
    return (
        <span
            title={status}
            className={`progress-status-dot progress-status--${status.toLowerCase()}`}
        />
    );
}
