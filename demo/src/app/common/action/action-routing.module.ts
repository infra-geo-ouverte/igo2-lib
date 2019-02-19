import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppActionComponent } from './action.component';

const routes: Routes = [
  {
    path: 'action',
    component: AppActionComponent
  }
];

export const AppActionRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
