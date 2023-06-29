import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
