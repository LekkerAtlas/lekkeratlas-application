import { useState } from 'react';

import { useAccessToken } from '@/features/auth/hooks/useAccessToken';
import { AddChannelForm } from '@/features/channel/components/AddChannelForm';
import { ProgressQueryView } from '@/features/progress/components/ProgressQueryView';
import { useProgressQuery } from '@/features/progress/hooks/useProgressQuery';

export function AddChannelRoute() {
    const accessToken = useAccessToken();
    const [queueJobId, setQueueJobId] = useState<string | null>(null);
    const progressQuery = useProgressQuery({ accessToken, queueJobId });

    return (
        <section>
            <h1>Add channel</h1>

            <div className="space-y-6">
                <AddChannelForm
                    onAccepted={setQueueJobId}
                    onSubmitting={() => setQueueJobId(null)}
                />

                {queueJobId && <ProgressQueryView query={progressQuery} />}
            </div>
        </section>
    );
}
