import { Routes, RouterModule } from '@angular/router';

import { AppImportExportComponent } from './import-export.component';

const routes: Routes = [
  {
    path: 'import-export',
    component: AppImportExportComponent
  }
];

export const AppImportExportRoutingModule = RouterModule.forChild(routes);
