import { Routes } from '@angular/router';

import { AppActionComponent } from './action/action.component';
import { AppDialogComponent } from './dialog/dialog.component';
import { AppDynamicComponentComponent } from './dynamic-component/dynamic-component.component';
import { AppEntitySelectorComponent } from './entity-selector/entity-selector.component';
import { AppEntityTableComponent } from './entity-table/entity-table.component';
import { AppFormComponent } from './form/form.component';
import { AppTableComponent } from './table/table.component';
import { AppToolComponent } from './tool/tool.component';
import { AppWidgetComponent } from './widget/widget.component';

export const routes: Routes = [
  { path: '', redirectTo: 'action', pathMatch: 'full' },
  {
    title: 'Action',
    path: 'action',
    component: AppActionComponent
  },
  {
    title: 'Dialogs',
    path: 'dialog',
    component: AppDialogComponent
  },
  {
    title: 'Dynamic Component',
    path: 'dynamic-component',
    component: AppDynamicComponentComponent
  },
  {
    title: 'Entity Table',
    path: 'entity-table',
    component: AppEntityTableComponent
  },
  {
    title: 'Entity Selector',
    path: 'entity-selector',
    component: AppEntitySelectorComponent
  },
  {
    title: 'form',
    path: 'Form',
    component: AppFormComponent
  },
  {
    title: 'Table',
    path: 'table',
    component: AppTableComponent
  },
  {
    title: 'Tool',
    path: 'tool',
    component: AppToolComponent
  },
  {
    title: 'Widget',
    path: 'widget',
    component: AppWidgetComponent
  }
];
