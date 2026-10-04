import { lazy } from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import RootLayout from './RootLayout';

const publicRoutes: RouteObject[] = [
  {
    path: '/',
    Component: lazy(() => import('./pages/renaissance/LandingPage')),
  },
  {
    path: '/search',
    Component: lazy(() => import('./pages/renaissance/PatentSearchPage')),
  },
  {
    path: '/dossier/:scanId',
    Component: lazy(() => import('./pages/renaissance/DossierPage')),
  },
  {
    path: '/laboratory',
    Component: lazy(() => import('./pages/renaissance/LaboratoryPage')),
  },
  {
    path: '/laboratory/:projectId',
    Component: lazy(() => import('./pages/renaissance/LaboratoryPage')),
  },
  {
    path: '/archive',
    Component: lazy(() => import('./pages/renaissance/ArchivePage')),
  },
  {
    path: '/archive/:projectId',
    Component: lazy(() => import('./pages/renaissance/ProjectPage')),
  },
  {
    path: '/settings',
    Component: lazy(() => import('./pages/renaissance/SettingsPage')),
  },
  {
    path: '/evaluation',
    Component: lazy(() => import('./pages/renaissance/EvaluationPage')),
  },
  {
    path: '/method',
    Component: lazy(() => import('./pages/renaissance/MethodPage')),
  },
  {
    path: '*',
    Component: lazy(() => import('./pages/NotFoundPage')),
  },
];

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: publicRoutes,
  },
]);
