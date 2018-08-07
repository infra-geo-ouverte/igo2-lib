import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppActivityComponent } from './activity.component';

const routes: Routes = [
  {
    path: 'activity',
    component: AppActivityComponent
  }
];

export const AppActivityRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
