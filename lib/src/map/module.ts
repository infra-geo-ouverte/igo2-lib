import { NgModule, ModuleWithProviders } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { IgoSharedModule } from '../shared';

// import { MapService } from './shared/map.service';

import { MapBrowserComponent } from './map-browser';
import { ZoomComponent } from './zoom';

/*
import { MapEditorComponent } from './map-editor/map-editor.component';
import { LayerListComponent } from './layer-list/layer-list.component';
import { LayerListItemComponent } from './layer-list-item/layer-list-item.component';
import { LayerEditorComponent } from './layer-editor/layer-editor.component';
import { LayerFormComponent } from './layer-form/layer-form.component';
import { LayerLegendComponent } from './layer-legend/layer-legend.component';
*/

@NgModule({
  imports: [
    IgoSharedModule,
    ReactiveFormsModule
  ],
  exports: [
    MapBrowserComponent,
    ZoomComponent
  ],
  declarations: [
    MapBrowserComponent,
    ZoomComponent,
    /*
    MapEditorComponent,
    LayerListComponent,
    LayerListItemComponent,
    LayerEditorComponent,
    LayerFormComponent,
    LayerLegendComponent
    */
  ],
  /*
  entryComponents: [
    MapEditorComponent,
    LayerEditorComponent
  ],
  */
})
export class IgoMapModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoMapModule,
      providers: []
    };
  }
}

export * from './map-browser';
export * from './zoom';
export * from './shared';
