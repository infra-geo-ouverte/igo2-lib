import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadToolComponent } from './download-tool';
import { MatCarouselModule } from '@ngbmodule/material-carousel';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleRequiredValidator } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RegionEditorComponent } from './region-editor/region-editor.component';
import { RegionManagerComponent } from './region-manager/region-manager.component';
import { MatTableModule } from '@angular/material/table';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ParentTileGenSliderComponent } from './tile-generation-option/tile-generation-sliders/parent-tile-gen-slider/parent-tile-gen-slider.component';
import { TileGenerationOptionComponent } from './tile-generation-option/tile-generation-option.component';
import { ChildTileGenSliderComponent } from './tile-generation-option/tile-generation-sliders/child-tile-gen-slider/child-tile-gen-slider.component';
import { MiddleTileGenSliderComponent } from './tile-generation-option/tile-generation-sliders/middle-tile-gen-slider/middle-tile-gen-slider.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    MatCarouselModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSliderModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTabsModule,
    FormsModule,
    MatTableModule,
    MatRippleModule,
    NgxSliderModule
  ],
  declarations: [
    DownloadToolComponent,
    RegionEditorComponent,
    RegionManagerComponent,
    TileGenerationOptionComponent,
    ChildTileGenSliderComponent,
    MiddleTileGenSliderComponent,
    ParentTileGenSliderComponent
  ],
  exports: [DownloadToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppDownloadModule {
  static forRoot(): ModuleWithProviders<IgoAppDownloadModule> {
    return {
      ngModule: IgoAppDownloadModule,
      providers: []
    };
  }
 }
