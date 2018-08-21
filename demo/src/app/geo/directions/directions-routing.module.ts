import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppDirectionsComponent } from './directions.component';

const routes: Routes = [
  {
    path: 'directions',
    component: AppDirectionsComponent
  }
];

export const AppDirectionsRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
