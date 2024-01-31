import { RouterModule, Routes } from '@angular/router';

import { AppDialogComponent } from './dialog.component';

const routes: Routes = [
  {
    path: 'dialog',
    component: AppDialogComponent
  }
];

export const AppDialogRoutingModule = RouterModule.forChild(routes);
