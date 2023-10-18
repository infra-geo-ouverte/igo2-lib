import { RouterModule, Routes } from '@angular/router';

import { AppOverlayComponent } from './overlay.component';

const routes: Routes = [
  {
    path: 'overlay',
    component: AppOverlayComponent
  }
];

export const AppOverlayRoutingModule = RouterModule.forChild(routes);
