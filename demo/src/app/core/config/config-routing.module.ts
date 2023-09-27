import { Routes, RouterModule } from '@angular/router';

import { AppConfigComponent } from './config.component';

const routes: Routes = [
  {
    path: 'config',
    component: AppConfigComponent
  }
];

export const AppConfigRoutingModule = RouterModule.forChild(routes);
