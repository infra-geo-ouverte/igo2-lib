import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { IgoFlexibleModule, IgoPanelModule } from '@igo2/common';

import { IgoFeatureModule } from '../feature/feature.module';
import { ToastComponent } from './toast.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    IgoPanelModule,
    IgoFlexibleModule,
    IgoFeatureModule
  ],
  exports: [ToastComponent],
  declarations: [ToastComponent]
})
export class IgoToastModule {
  static forRoot(): ModuleWithProviders<IgoToastModule> {
    return {
      ngModule: IgoToastModule
    };
  }
}
