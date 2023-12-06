import { RouterModule, Routes } from '@angular/router';

import { AppMediaComponent } from './media.component';

const routes: Routes = [
  {
    path: 'media',
    component: AppMediaComponent
  }
];

export const AppMediaRoutingModule = RouterModule.forChild(routes);
