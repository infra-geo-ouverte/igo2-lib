import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppEditionComponent } from './edition.component';

const routes: Routes = [
  {
    path: 'edition',
    component: AppEditionComponent
  }
];

export const AppEditionRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
