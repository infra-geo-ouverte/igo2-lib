import { RouterModule, Routes } from '@angular/router';

import { AppContextComponent } from './context.component';

const routes: Routes = [
  {
    path: 'context',
    component: AppContextComponent
  }
];

export const AppContextRoutingModule = RouterModule.forChild(routes);
