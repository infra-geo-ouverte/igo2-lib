import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppGeoComponent } from './geo.component';

const routes: Routes = [
  {
    path: 'geo',
    component: AppGeoComponent
  }
];

export const AppGeoRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
