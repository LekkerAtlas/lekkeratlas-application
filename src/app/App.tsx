import { LoginButton } from '@/features/auth/components/LoginButton';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { AddChannelForm } from '@/features/channel/components/AddChannelForm';

export function App() {
    return (
        <>
            <LoginButton />

            <RequireAuth>
                {/* <MeExample /> */}

                <AddChannelForm />
            </RequireAuth>
        </>
    );
}
