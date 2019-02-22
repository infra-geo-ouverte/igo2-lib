import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SimpleNotificationsModule } from 'angular2-notifications';

import { MessageCenterComponent } from './message-center/message-center.component';

@NgModule({
  imports: [CommonModule, SimpleNotificationsModule.forRoot()],
  declarations: [MessageCenterComponent],
  exports: [MessageCenterComponent]
})
export class IgoMessageModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoMessageModule,
      providers: []
    };
  }
}
