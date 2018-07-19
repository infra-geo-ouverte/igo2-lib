import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppQueryComponent } from './query.component';

const routes: Routes = [
  {
    path: 'query',
    component: AppQueryComponent
  }
];

export const AppQueryRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
