import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppDynamicComponentComponent } from './dynamic-component.component';

const routes: Routes = [
  {
    path: 'dynamic-component',
    component: AppDynamicComponentComponent
  }
];

export const AppDynamicComponentRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
