import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppSearchComponent } from './search.component';

const routes: Routes = [
  {
    path: 'search',
    component: AppSearchComponent
  }
];

export const AppSearchRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
