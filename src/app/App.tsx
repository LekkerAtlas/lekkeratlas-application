import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginButton } from '@/features/auth/components/LoginButton';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { AddChannelForm } from '@/features/channel/components/AddChannelForm';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,
            retry: 1,
        },
    },
});

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <LoginButton />

            <RequireAuth>
                {/* <MeExample /> */}

                <AddChannelForm />
            </RequireAuth>
        </QueryClientProvider>
    );
}
