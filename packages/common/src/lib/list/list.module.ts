import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { IgoClickoutModule } from '../clickout/clickout.module';
import { ListItemDirective } from './list-item.directive';
import { ListComponent } from './list.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    IgoClickoutModule,
    ListItemDirective,
    ListComponent
  ],
  exports: [ListItemDirective, ListComponent]
})
export class IgoListModule {
  static forRoot(): ModuleWithProviders<IgoListModule> {
    return {
      ngModule: IgoListModule,
      providers: []
    };
  }
}
