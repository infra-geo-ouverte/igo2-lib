import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IgoLanguageModule } from '@igo2/core';
import {
  IgoLayerModule,
  IgoMetadataModule,
  IgoDownloadModule,
  IgoFilterModule,
  IgoImportExportModule
} from '@igo2/geo';
import { IgoContextModule } from '@igo2/context';
import { MapDetailsToolComponent } from './map-details-tool/map-details-tool.component';
import { MapToolComponent } from './map-tool/map-tool.component';
import { MapToolsComponent } from './map-tools/map-tools.component';
import { MapLegendToolComponent } from './map-legend/map-legend-tool.component';
import { IgoAppWorkspaceModule } from '../workspace/workspace.module';
import { AdvancedMapToolComponent } from './advanced-map-tool/advanced-map-tool.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IgoSpinnerModule } from '@igo2/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdvancedSwipeComponent } from './advanced-map-tool/advanced-swipe/advanced-swipe.component';
import { AdvancedCoordinatesComponent } from './advanced-map-tool/advanced-coordinates/advanced-coordinates.component';
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
    IgoFilterModule,
    IgoContextModule,
    IgoAppWorkspaceModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule
  ],
  declarations: [ AdvancedMapToolComponent, MapToolComponent,
    MapToolsComponent, MapDetailsToolComponent, MapLegendToolComponent, AdvancedSwipeComponent, AdvancedCoordinatesComponent],
  exports: [AdvancedMapToolComponent, MapToolComponent, MapToolsComponent, MapDetailsToolComponent, MapLegendToolComponent],
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
