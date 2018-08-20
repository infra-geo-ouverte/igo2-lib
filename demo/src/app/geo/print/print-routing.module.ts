import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppPrintComponent } from './print.component';

const routes: Routes = [
  {
    path: 'print',
    component: AppPrintComponent
  }
];

export const AppPrintRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
