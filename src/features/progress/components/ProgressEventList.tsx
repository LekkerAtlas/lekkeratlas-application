import type { ProgressStatusEvent } from '@/features/progress/progressTypes';
import { ProgressStatusDot } from './ProgressStatusBadge';
import '@/features/progress/progress.css';

export function ProgressEventList({
    events,
}: {
    events: ProgressStatusEvent[];
}) {
    return (
        <ol className="progress-events">
            {events.map((event, index) => (
                <li key={event.id} className="progress-event">
                    <div className="progress-event__marker">
                        <ProgressStatusDot status={event.status} />
                        {index < events.length - 1 && (
                            <span className="progress-event__line" />
                        )}
                    </div>

                    <div className="progress-event__content">
                        <p className="progress-event__message">
                            {event.message}
                        </p>
                        <p className="progress-event__status">{event.status}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
}
