import { Routes, RouterModule } from '@angular/router';


import { AppSimpleListComponent } from './simple-list.component';

const routes: Routes = [
  {
    path: 'simple-list',
    component: AppSimpleListComponent
  }
];

export const AppSimpleListRoutingModule = RouterModule.forChild(
  routes
);
