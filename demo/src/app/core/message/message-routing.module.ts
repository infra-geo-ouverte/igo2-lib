import { RouterModule, Routes } from '@angular/router';

import { AppMessageComponent } from './message.component';

const routes: Routes = [
  {
    path: 'message',
    component: AppMessageComponent
  }
];

export const AppMessageRoutingModule = RouterModule.forChild(routes);
