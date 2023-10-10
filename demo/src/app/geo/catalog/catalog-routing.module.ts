import { Routes, RouterModule } from '@angular/router';

import { AppCatalogComponent } from './catalog.component';

const routes: Routes = [
  {
    path: 'catalog',
    component: AppCatalogComponent
  }
];

export const AppCatalogRoutingModule = RouterModule.forChild(routes);
