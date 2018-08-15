import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppAuthFormComponent } from './auth-form.component';

const routes: Routes = [
  {
    path: 'auth-form',
    component: AppAuthFormComponent
  }
];

export const AppAuthFormRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
