import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';

import { SharedModule } from '../../shared/shared.module';
import { AppRequestThemeModule } from './theme-routing.module';
import { AppThemeComponent } from './theme.component';

@NgModule({
  imports: [
    AppRequestThemeModule,
    SharedModule,
    MatSelectModule,
    AppThemeComponent
  ],
  exports: [AppThemeComponent]
})
export class AppThemeModule {}
