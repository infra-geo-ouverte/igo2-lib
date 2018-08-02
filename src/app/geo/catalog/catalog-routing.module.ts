import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppCatalogComponent } from './catalog.component';

const routes: Routes = [
  {
    path: 'catalog',
    component: AppCatalogComponent
  }
];

export const AppCatalogRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
