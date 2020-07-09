import { NgModule, ModuleWithProviders } from '@angular/core';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

import { IgoGestureConfig } from './gesture.provider';

@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class IgoGestureModule {
  static forRoot(): ModuleWithProviders<IgoGestureModule> {
    return {
      ngModule: IgoGestureModule,
      providers: [
        {
          provide: HAMMER_GESTURE_CONFIG,
          useClass: IgoGestureConfig
        }
      ]
    };
  }
}
