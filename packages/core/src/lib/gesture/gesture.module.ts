import { ModuleWithProviders, NgModule } from '@angular/core';
import { HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';

import { IgoGestureConfig } from './gesture.provider';

@NgModule({
  imports: [HammerModule],
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
