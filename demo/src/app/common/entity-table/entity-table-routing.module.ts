import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppEntityTableComponent } from './entity-table.component';

const routes: Routes = [
  {
    path: 'entity-table',
    component: AppEntityTableComponent
  }
];

export const AppEntityTableRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
