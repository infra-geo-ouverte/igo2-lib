import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppToolComponent } from './tool.component';

const routes: Routes = [
  {
    path: 'tool',
    component: AppToolComponent
  }
];

export const AppToolRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
