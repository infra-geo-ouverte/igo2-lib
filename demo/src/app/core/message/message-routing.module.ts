import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppMessageComponent } from './message.component';

const routes: Routes = [
  {
    path: 'message',
    component: AppMessageComponent
  }
];

export const AppMessageRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
