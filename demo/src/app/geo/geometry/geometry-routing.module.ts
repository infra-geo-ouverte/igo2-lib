import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppGeometryComponent } from './geometry.component';

const routes: Routes = [
  {
    path: 'geometry',
    component: AppGeometryComponent
  }
];

export const AppGeometryRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
