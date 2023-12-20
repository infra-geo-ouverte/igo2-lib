import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoCustomHtmlModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { ShareMapApiComponent } from './share-map/share-map-api.component';
import { ShareMapUrlComponent } from './share-map/share-map-url.component';
import { ShareMapComponent } from './share-map/share-map.component';

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
    IgoCustomHtmlModule,
    ShareMapComponent,
    ShareMapUrlComponent,
    ShareMapApiComponent
  ],
  exports: [ShareMapComponent, ShareMapUrlComponent, ShareMapApiComponent]
})
export class IgoShareMapModule {
  static forRoot(): ModuleWithProviders<IgoShareMapModule> {
    return {
      ngModule: IgoShareMapModule
    };
  }
}
