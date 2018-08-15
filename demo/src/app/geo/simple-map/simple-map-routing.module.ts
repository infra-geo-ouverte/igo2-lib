import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppSimpleMapComponent } from './simple-map.component';

const routes: Routes = [
  {
    path: 'simple-map',
    component: AppSimpleMapComponent
  }
];

export const AppSimpleMapRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
