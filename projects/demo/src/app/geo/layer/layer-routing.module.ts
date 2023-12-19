import { RouterModule, Routes } from '@angular/router';

import { AppLayerComponent } from './layer.component';

const routes: Routes = [
  {
    path: 'layer',
    component: AppLayerComponent
  }
];

export const AppLayerRoutingModule = RouterModule.forChild(routes);
