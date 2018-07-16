import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatListModule } from '@angular/material';

import { IgoClickoutModule } from '../clickout/clickout.module';

import { ListItemDirective } from './list-item.directive';
import { ListComponent } from './list.component';

@NgModule({
  imports: [CommonModule, MatIconModule, MatListModule, IgoClickoutModule],
  declarations: [ListItemDirective, ListComponent],
  exports: [ListItemDirective, ListComponent]
})
export class IgoListModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoListModule,
      providers: []
    };
  }
}
