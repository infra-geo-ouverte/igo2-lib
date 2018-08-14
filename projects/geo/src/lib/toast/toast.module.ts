import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatButtonModule } from '@angular/material';

import { IgoPanelModule, IgoFlexibleModule } from '@igo2/common';

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
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoToastModule
    };
  }
}
