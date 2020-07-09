import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core';
import { IgoPanelModule, IgoFlexibleModule } from '@igo2/common';
import { IgoFeatureModule } from '@igo2/geo';

import { IgoContextManagerModule } from '../context-manager/context-manager.module';
import { SidenavComponent } from './sidenav.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatTooltipModule,
    IgoLanguageModule,
    IgoPanelModule,
    IgoFlexibleModule,
    IgoFeatureModule,
    IgoContextManagerModule
  ],
  exports: [SidenavComponent],
  declarations: [SidenavComponent]
})
export class IgoSidenavModule {
  static forRoot(): ModuleWithProviders<IgoSidenavModule> {
    return {
      ngModule: IgoSidenavModule
    };
  }
}
