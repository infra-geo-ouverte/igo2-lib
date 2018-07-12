import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppRequestComponent } from './request.component';

const routes: Routes = [
  {
    path: 'request',
    component: AppRequestComponent
  }
];

export const AppRequestRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
