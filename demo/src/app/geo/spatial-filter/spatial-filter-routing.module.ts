import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppSpatialFilterComponent } from './spatial-filter.component';

const routes: Routes = [
  {
    path: 'spatial-filter',
    component: AppSpatialFilterComponent
  }
];

export const AppSpatialFilterRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
