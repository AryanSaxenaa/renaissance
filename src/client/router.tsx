import { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouteObject, useLocation, useSearchParams } from 'react-router-dom';
import { useSession } from 'modelence/client';

// For guest-only routes (login, signup) - redirects to home if already logged in
function GuestRoute() {
  const { user } = useSession();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const encodedRedirect = searchParams.get('_redirect');
  const redirect = encodedRedirect ? decodeURIComponent(encodedRedirect) : '/';

  if (user) {
    return <Navigate to={redirect} state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// For protected routes - redirects to login if not authenticated
function PrivateRoute() {
  const { user } = useSession();
  const location = useLocation();

  if (!user) {
    const fullPath = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?_redirect=${encodeURIComponent(fullPath)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}

// Public routes (no auth required)
const publicRoutes: RouteObject[] = [
  {
    path: '/',
    Component: lazy(() => import('./pages/renaissance/LandingPage'))
  },
  {
    path: '/search',
    Component: lazy(() => import('./pages/renaissance/PatentSearchPage'))
  },
  {
    path: '/laboratory',
    Component: lazy(() => import('./pages/renaissance/LaboratoryPage'))
  },
  {
    path: '/laboratory/:projectId',
    Component: lazy(() => import('./pages/renaissance/LaboratoryPage'))
  },
  {
    path: '/archive',
    Component: lazy(() => import('./pages/renaissance/ArchivePage'))
  },
  {
    path: '/settings',
    Component: lazy(() => import('./pages/renaissance/SettingsPage'))
  },
  {
    path: '/terms',
    Component: lazy(() => import('./pages/TermsPage'))
  },
  {
    path: '/logout',
    Component: lazy(() => import('./pages/LogoutPage'))
  },
  {
    path: '*',
    Component: lazy(() => import('./pages/NotFoundPage'))
  }
];

// Guest routes (redirect to home if already logged in)
const guestRoutes: RouteObject[] = [
  {
    path: '/login',
    Component: lazy(() => import('./pages/LoginPage'))
  },
  {
    path: '/signup',
    Component: lazy(() => import('./pages/SignupPage'))
  }
];

// Private routes (redirect to login if not authenticated)
const privateRoutes: RouteObject[] = [
  // Add private routes here if needed
];

export const router = createBrowserRouter([
  ...publicRoutes,
  {
    Component: GuestRoute,
    children: guestRoutes
  },
  {
    Component: PrivateRoute,
    children: privateRoutes
  }
]);
