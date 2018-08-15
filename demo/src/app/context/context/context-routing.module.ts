import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppContextComponent } from './context.component';

const routes: Routes = [
  {
    path: 'context',
    component: AppContextComponent
  }
];

export const AppContextRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
