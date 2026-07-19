import { AppAuthProvider } from '@/app/providers/AppAuthProvider';
import { AppQueryProvider } from '@/app/providers/AppQueryProvider';

export function AppProvider({ children }: Readonly<React.PropsWithChildren>) {
    return (
        <AppAuthProvider>
            <AppQueryProvider>{children}</AppQueryProvider>
        </AppAuthProvider>
    );
}
