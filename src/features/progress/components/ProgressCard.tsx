import type { Progress } from '@/features/progress/progressTypes';
import { ProgressEventList } from './ProgressEventList';
import { ProgressStatusBadge } from './ProgressStatusBadge';
import '@/features/progress/progress.css';
import { CancelJobButton } from './CancelJobButton';
import { ProgressStatus } from '@/features/progress/progressStatus';

export function ProgressCard({
    progress,
    depth = 0,
}: Readonly<{
    progress: Progress;
    depth?: number;
}>) {
    const hasChildren = progress.childProgresses.length > 0;

    return (
        <article className="progress-card">
            <header className="progress-card__header">
                <div>
                    <p className="progress-card__label">
                        {depth === 0 ? 'Main job' : 'Child job'}
                    </p>
                    <p className="progress-card__id">{progress.id}</p>
                </div>

                <CancelJobButton
                    jobId={progress.id}
                    status={new ProgressStatus(progress.latestStatus)}
                />
                <ProgressStatusBadge status={progress.latestStatus} />
            </header>

            <ProgressEventList events={progress.events} />

            {hasChildren && (
                <details className="progress-children" open={depth === 0}>
                    <summary className="progress-children__summary">
                        {progress.childProgresses.length} child jobs
                    </summary>

                    <div className="progress-children__content">
                        {progress.childProgresses.map((child) => (
                            <ProgressCard
                                key={child.id}
                                progress={child}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                </details>
            )}
        </article>
    );
}
