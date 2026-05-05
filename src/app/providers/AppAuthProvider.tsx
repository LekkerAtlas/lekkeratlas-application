import { authConfig } from "@/features/auth/config/authConfig";
import { AuthProvider } from "react-oidc-context";

export function AppAuthProvider({ children }: React.PropsWithChildren) {
    return <AuthProvider {...authConfig}>{children}</AuthProvider>;
}