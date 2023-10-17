import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoEntityTableModule, IgoSpinnerModule } from '@igo2/common';
import { IgoContextModule } from '@igo2/context';
import { IgoLanguageModule } from '@igo2/core';
import {
  IgoDownloadModule,
  IgoFilterModule,
  IgoImportExportModule,
  IgoLayerModule,
  IgoMetadataModule,
  IgoStyleModule
} from '@igo2/geo';

import { IgoAppWorkspaceModule } from '../workspace/workspace.module';
import { AdvancedCoordinatesComponent } from './advanced-map-tool/advanced-coordinates/advanced-coordinates.component';
import { AdvancedMapToolComponent } from './advanced-map-tool/advanced-map-tool.component';
import { AdvancedSwipeComponent } from './advanced-map-tool/advanced-swipe/advanced-swipe.component';
import { MapDetailsToolComponent } from './map-details-tool/map-details-tool.component';
import { MapLegendToolComponent } from './map-legend/map-legend-tool.component';
import { MapProximityToolComponent } from './map-proximity-tool/map-proximity-tool.component';
import { MapToolComponent } from './map-tool/map-tool.component';
import { MapToolsComponent } from './map-tools/map-tools.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    IgoSpinnerModule,
    CommonModule,
    MatTabsModule,
    MatListModule,
    MatIconModule,
    IgoLanguageModule,
    IgoLayerModule,
    IgoMetadataModule,
    IgoDownloadModule,
    IgoImportExportModule,
    IgoStyleModule,
    IgoFilterModule,
    MatRadioModule,
    IgoContextModule,
    IgoAppWorkspaceModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    IgoEntityTableModule
  ],
  declarations: [
    AdvancedMapToolComponent,
    MapProximityToolComponent,
    MapToolComponent,
    MapToolsComponent,
    MapDetailsToolComponent,
    MapLegendToolComponent,
    AdvancedSwipeComponent,
    AdvancedCoordinatesComponent
  ],
  exports: [
    AdvancedMapToolComponent,
    MapProximityToolComponent,
    MapToolComponent,
    MapToolsComponent,
    MapDetailsToolComponent,
    MapLegendToolComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppMapModule {
  static forRoot(): ModuleWithProviders<IgoAppMapModule> {
    return {
      ngModule: IgoAppMapModule,
      providers: []
    };
  }
}
