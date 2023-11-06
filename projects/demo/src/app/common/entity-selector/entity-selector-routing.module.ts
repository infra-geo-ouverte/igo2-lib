import { RouterModule, Routes } from '@angular/router';

import { AppEntitySelectorComponent } from './entity-selector.component';

const routes: Routes = [
  {
    path: 'entity-selector',
    component: AppEntitySelectorComponent
  }
];

export const AppEntitySelectorRoutingModule = RouterModule.forChild(routes);
