import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';

import { IgoLanguageModule } from '@igo2/core';

import { ShareMapComponent } from './share-map/share-map.component';
import { ShareMapUrlComponent } from './share-map/share-map-url.component';
import { ShareMapApiComponent } from './share-map/share-map-api.component';
import { IgoCustomHtmlModule } from '@igo2/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoCustomHtmlModule
  ],
  exports: [ShareMapComponent, ShareMapUrlComponent, ShareMapApiComponent],
  declarations: [ShareMapComponent, ShareMapUrlComponent, ShareMapApiComponent]
})
export class IgoShareMapModule {
  static forRoot(): ModuleWithProviders<IgoShareMapModule> {
    return {
      ngModule: IgoShareMapModule
    };
  }
}
