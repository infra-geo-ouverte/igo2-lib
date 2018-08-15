import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppHomeComponent } from './home.component';

const routes: Routes = [
  {
    path: 'home',
    component: AppHomeComponent
  }
];

export const AppHomeRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
