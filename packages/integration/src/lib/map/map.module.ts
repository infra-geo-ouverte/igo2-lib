import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { IgoLanguageModule } from '@igo2/core';
import {
  IgoLayerModule,
  IgoMetadataModule,
  IgoDownloadModule,
  IgoFilterModule,
  IgoImportExportModule,
  IgoStyleModule
} from '@igo2/geo';
import { IgoContextModule } from '@igo2/context';
import { MapDetailsToolComponent } from './map-details-tool/map-details-tool.component';
import { MapToolComponent } from './map-tool/map-tool.component';
import { MapToolsComponent } from './map-tools/map-tools.component';
import { MapLegendToolComponent } from './map-legend/map-legend-tool.component';
import { IgoAppWorkspaceModule } from '../workspace/workspace.module';
import { AdvancedMapToolComponent } from './advanced-map-tool/advanced-map-tool.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { IgoEntityTableModule, IgoSpinnerModule } from '@igo2/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdvancedSwipeComponent } from './advanced-map-tool/advanced-swipe/advanced-swipe.component';
import { AdvancedCoordinatesComponent } from './advanced-map-tool/advanced-coordinates/advanced-coordinates.component';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MapProximityToolComponent } from './map-proximity-tool/map-proximity-tool.component';

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
  declarations: [ AdvancedMapToolComponent, MapProximityToolComponent, MapToolComponent,
    MapToolsComponent, MapDetailsToolComponent, MapLegendToolComponent, AdvancedSwipeComponent, AdvancedCoordinatesComponent],
  exports: [AdvancedMapToolComponent, MapProximityToolComponent, MapToolComponent,
    MapToolsComponent, MapDetailsToolComponent, MapLegendToolComponent],
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
