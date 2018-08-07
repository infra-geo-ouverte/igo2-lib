import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppMediaComponent } from './media.component';

const routes: Routes = [
  {
    path: 'media',
    component: AppMediaComponent
  }
];

export const AppMediaRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
