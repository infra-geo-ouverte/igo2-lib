import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppImportExportComponent } from './import-export.component';

const routes: Routes = [
  {
    path: 'import-export',
    component: AppImportExportComponent
  }
];

export const AppImportExportRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
