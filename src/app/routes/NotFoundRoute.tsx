import { appPaths } from '@/config/paths';
import { Link } from 'react-router';

export function NotFoundRoute() {
    return (
        <main>
            <h1>Page not found</h1>
            <p>The requested page does not exist.</p>
            <Link to={appPaths.videos}>Return to videos</Link>
        </main>
    );
}
