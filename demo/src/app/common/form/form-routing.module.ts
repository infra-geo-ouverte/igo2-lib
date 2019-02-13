import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppFormComponent } from './form.component';

const routes: Routes = [
  {
    path: 'form',
    component: AppFormComponent
  }
];

export const AppFormRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
