import { Routes, RouterModule } from '@angular/router';

import { AppWorkspaceComponent } from './workspace.component';

const routes: Routes = [
  {
    path: 'workspace',
    component: AppWorkspaceComponent
  }
];

export const AppWorkspaceRoutingModule = RouterModule.forChild(routes);
