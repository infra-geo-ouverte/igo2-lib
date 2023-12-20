import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoFlexibleModule, PanelComponent } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';
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
    PanelComponent,
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
