import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppTimeFilterComponent } from './time-filter.component';

const routes: Routes = [
  {
    path: 'time-filter',
    component: AppTimeFilterComponent
  }
];

export const AppTimeFilterRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
