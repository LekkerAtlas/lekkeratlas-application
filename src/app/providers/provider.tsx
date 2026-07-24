import { AppAuthProvider } from '@/app/providers/AppAuthProvider';
import { AppQueryProvider } from '@/app/providers/AppQueryProvider';
import { BrowserRouter } from 'react-router';

export function AppProvider({ children }: Readonly<React.PropsWithChildren>) {
    return (
        <BrowserRouter>
            <AppAuthProvider>
                <AppQueryProvider>{children}</AppQueryProvider>
            </AppAuthProvider>
        </BrowserRouter>
    );
}
