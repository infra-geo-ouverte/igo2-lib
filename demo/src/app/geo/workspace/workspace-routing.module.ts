import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppWorkspaceComponent } from './workspace.component';

const routes: Routes = [
  {
    path: 'workspace',
    component: AppWorkspaceComponent
  }
];

export const AppWorkspaceRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
