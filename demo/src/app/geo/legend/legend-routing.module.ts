import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppLegendComponent } from './legend.component';

const routes: Routes = [
  {
    path: 'legend',
    component: AppLegendComponent
  }
];

export const AppLegendRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
