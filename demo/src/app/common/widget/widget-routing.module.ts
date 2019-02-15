import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppWidgetComponent } from './widget.component';

const routes: Routes = [
  {
    path: 'widget',
    component: AppWidgetComponent
  }
];

export const AppWidgetRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
