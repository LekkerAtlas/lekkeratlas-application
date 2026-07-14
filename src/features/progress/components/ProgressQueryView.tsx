import type { ProgressQueryResult } from '@/features/progress/progressTypes';
import { ProgressCard } from './ProgressCard';
import '@/features/progress/progress.css';

export function ProgressQueryView({
    query,
}: Readonly<{ query: ProgressQueryResult }>) {
    if (query.isPending) return <p>Loading progress...</p>;
    if (query.isError)
        return <p>Failed to load progress: {query.error.message}</p>;

    return (
        <div className="progress-shell">
            <ProgressCard progress={query.data.progress} />
        </div>
    );
}
