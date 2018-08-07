import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppOgcFilterComponent } from './ogc-filter.component';

const routes: Routes = [
  {
    path: 'ogc-filter',
    component: AppOgcFilterComponent
  }
];

export const AppOgcFilterRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
