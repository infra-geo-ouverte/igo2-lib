import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppTableComponent } from './table.component';

const routes: Routes = [
  {
    path: 'table',
    component: AppTableComponent
  }
];

export const AppTableRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
