import { lazy } from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';

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
    path: '*',
    Component: lazy(() => import('./pages/NotFoundPage'))
  }
];

export const router = createBrowserRouter(publicRoutes);
