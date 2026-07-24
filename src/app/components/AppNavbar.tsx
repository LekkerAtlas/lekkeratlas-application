import { appPaths } from '@/config/paths';
import { LoginButton } from '@/features/auth/components/LoginButton';
import { NavLink } from 'react-router';

function getLinkClassName({ isActive }: Readonly<{ isActive: boolean }>) {
    return isActive
        ? 'app-navbar__link app-navbar__link--active'
        : 'app-navbar__link';
}

export function AppNavbar() {
    return (
        <header className="app-navbar">
            <NavLink className="app-navbar__brand" to={appPaths.videos}>
                LekkerAtlas
            </NavLink>

            <nav className="app-navbar__links" aria-label="Main navigation">
                <NavLink className={getLinkClassName} to={appPaths.videos}>
                    Videos
                </NavLink>
                <NavLink className={getLinkClassName} to={appPaths.addChannel}>
                    Add channel
                </NavLink>
                <NavLink className={getLinkClassName} to={appPaths.settings}>
                    Settings
                </NavLink>
            </nav>

            <div className="app-navbar__session">
                <LoginButton />
            </div>
        </header>
    );
}
