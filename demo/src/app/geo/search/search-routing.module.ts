import { RouterModule, Routes } from '@angular/router';

import { AppSearchComponent } from './search.component';

const routes: Routes = [
  {
    path: 'search',
    component: AppSearchComponent
  }
];

export const AppSearchRoutingModule = RouterModule.forChild(routes);
