import { RouterModule, Routes } from '@angular/router';

import { AppPrintComponent } from './print.component';

const routes: Routes = [
  {
    path: 'print',
    component: AppPrintComponent
  }
];

export const AppPrintRoutingModule = RouterModule.forChild(routes);
