import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppMeasureComponent } from './measure.component';

const routes: Routes = [
  {
    path: 'measure',
    component: AppMeasureComponent
  }
];

export const AppMeasureRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
