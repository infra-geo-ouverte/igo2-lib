import { Routes } from '@angular/router';

import { AppActivityComponent } from './activity/activity.component';
import { AppConfigComponent } from './config/config.component';
import { AppLanguageComponent } from './language/language.component';
import { AppMediaComponent } from './media/media.component';
import { AppMessageComponent } from './message/message.component';
import { AppMonitoringComponent } from './monitoring/monitoring.component';
import { AppRequestComponent } from './request/request.component';
import { AppThemeComponent } from './theme/theme.component';

export const routes: Routes = [
  { path: '', redirectTo: 'activity', pathMatch: 'full' },
  {
    title: 'Activity',
    path: 'activity',
    component: AppActivityComponent
  },
  {
    title: 'Config',
    path: 'config',
    component: AppConfigComponent
  },
  {
    title: 'Language',
    path: 'language',
    component: AppLanguageComponent
  },
  {
    title: 'Media',
    path: 'media',
    component: AppMediaComponent
  },
  {
    title: 'Message',
    path: 'message',
    component: AppMessageComponent
  },
  {
    title: 'Monitoring',
    path: 'monitoring',
    component: AppMonitoringComponent
  },
  {
    title: 'Request',
    path: 'request',
    component: AppRequestComponent
  },
  {
    title: 'Themes',
    path: 'theme',
    component: AppThemeComponent
  }
];
