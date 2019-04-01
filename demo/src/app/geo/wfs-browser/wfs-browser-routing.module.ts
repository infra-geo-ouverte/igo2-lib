import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppWfsBrowserComponent } from './wfs-browser.component';

const routes: Routes = [
  {
    path: 'wfs-browser',
    component: AppWfsBrowserComponent
  }
];

export const AppWfsBrowserRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
