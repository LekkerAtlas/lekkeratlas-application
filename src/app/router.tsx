import { AppLayout } from '@/app/layouts/AppLayout';
import { AddChannelRoute } from '@/app/routes/AddChannelRoute';
import { LoginRoute } from '@/app/routes/LoginRoute';
import { NotFoundRoute } from '@/app/routes/NotFoundRoute';
import { appPaths } from '@/config/paths';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { SettingsRoute } from '@/features/settings/routes/SettingsRoute';
import { VideoBrowsingRoute } from '@/features/videos/routes/VideoBrowsingRoute';
import { VideoViewerRoute } from '@/features/videos/routes/VideoViewerRoute';
import { Navigate, Route, Routes } from 'react-router';

export function AppRouter() {
    return (
        <Routes>
            <Route path={appPaths.login} element={<LoginRoute />} />

            <Route element={<RequireAuth />}>
                <Route element={<AppLayout />}>
                    <Route
                        path={appPaths.root}
                        element={<Navigate to={appPaths.videos} replace />}
                    />
                    <Route
                        path={appPaths.videos}
                        element={<VideoBrowsingRoute />}
                    />
                    <Route
                        path={appPaths.video}
                        element={<VideoViewerRoute />}
                    />
                    <Route
                        path={appPaths.addChannel}
                        element={<AddChannelRoute />}
                    />
                    <Route
                        path={appPaths.settings}
                        element={<SettingsRoute />}
                    />
                </Route>
            </Route>

            <Route path="*" element={<NotFoundRoute />} />
        </Routes>
    );
}
