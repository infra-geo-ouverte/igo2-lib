import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppConfigComponent } from './config.component';

const routes: Routes = [
  {
    path: 'config',
    component: AppConfigComponent
  }
];

export const AppConfigRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
