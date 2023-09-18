import { Routes, RouterModule } from '@angular/router';

import { AppFeatureComponent } from './feature.component';

const routes: Routes = [
  {
    path: 'feature',
    component: AppFeatureComponent
  }
];

export const AppFeatureRoutingModule = RouterModule.forChild(routes);
