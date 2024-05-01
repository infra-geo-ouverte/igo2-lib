import { Route, Routes } from '@angular/router';

import { routes as authRoutes } from './auth/auth.routing';
import { routes as commonRoutes } from './common/common.routing';
import { routes as contextRoutes } from './context/context.routing';
import { routes as coreRoutes } from './core/core.routing';
import { routes as geoRoutes } from './geo/geo.routing';
import { AppHomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { title: 'Home', path: 'home', component: AppHomeComponent },
  {
    title: 'Auth',
    path: 'auth',
    loadChildren: () => import('./auth/auth.routing').then((m) => m.routes)
  },
  {
    title: 'Common',
    path: 'common',
    loadChildren: () => import('./common/common.routing').then((m) => m.routes)
  },
  {
    title: 'Context',
    path: 'context',
    loadChildren: () =>
      import('./context/context.routing').then((m) => m.routes)
  },
  {
    title: 'Core',
    path: 'core',
    loadChildren: () => import('./core/core.routing').then((m) => m.routes)
  },
  {
    title: 'Geo',
    path: 'geo',
    loadChildren: () => import('./geo/geo.routing').then((m) => m.routes)
  },
  { path: '**', redirectTo: '/home' }
];

export const ROUTES_CONFIG: Routes = [
  { title: 'Home', path: 'home', redirectTo: '/home', pathMatch: 'full' },
  {
    title: 'Core',
    path: 'core',
    children: getRoutesConfig(coreRoutes)
  },
  {
    title: 'Auth',
    path: 'auth',
    children: getRoutesConfig(authRoutes)
  },
  {
    title: 'Common',
    path: 'common',
    children: getRoutesConfig(commonRoutes)
  },
  {
    title: 'Geo',
    path: 'geo',
    children: getRoutesConfig(geoRoutes)
  },
  {
    title: 'Context',
    path: 'context',
    children: getRoutesConfig(contextRoutes)
  }
];

function getRoutesConfig(routes: Route[]): Route[] {
  return routes
    .filter((route) => route.title)
    .sort((a, b) => (a.title as string).localeCompare(b.title as string));
}
