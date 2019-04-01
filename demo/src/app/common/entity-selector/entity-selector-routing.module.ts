import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppEntitySelectorComponent } from './entity-selector.component';

const routes: Routes = [
  {
    path: 'entity-selector',
    component: AppEntitySelectorComponent
  }
];

export const AppEntitySelectorRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
