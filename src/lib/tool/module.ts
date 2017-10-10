import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IgoSharedModule } from '../shared';
import { IgoContextModule } from '../context/module';
import { IgoDataSourceModule } from '../datasource';
import { IgoFeatureModule } from '../feature';
import { IgoFilterModule } from '../filter';
import { IgoLayerModule } from '../layer';
import { IgoMapModule } from '../map';
import { IgoCatalogModule } from '../catalog';
import { IgoPrintModule } from '../print';

import { ToolService } from './shared';
import { ToolbarComponent, ToolbarBindingDirective } from './toolbar';
import { ToolbarItemComponent } from './toolbar-item';
import { ToolboxComponent } from './toolbox';

import { ContextManagerToolComponent,
         ContextEditorToolComponent,
         ToolsContextManagerToolComponent,
         PermissionsContextManagerToolComponent,
         MapDetailsToolComponent,
         CatalogToolComponent,
         CatalogLayersToolComponent,
         SearchResultsToolComponent,
         PrintToolComponent,
         TimeAnalysisToolComponent } from './tools';

const IGO_TOOLS = [
  ContextManagerToolComponent,
  ContextEditorToolComponent,
  ToolsContextManagerToolComponent,
  PermissionsContextManagerToolComponent,
  MapDetailsToolComponent,
  CatalogToolComponent,
  CatalogLayersToolComponent,
  SearchResultsToolComponent,
  PrintToolComponent,
  TimeAnalysisToolComponent
];

@NgModule({
  imports: [
    IgoSharedModule,
    IgoContextModule,
    IgoDataSourceModule,
    IgoFeatureModule,
    IgoFilterModule,
    IgoLayerModule,
    IgoMapModule,
    IgoCatalogModule,
    IgoPrintModule
  ],
  exports: [
    ToolbarComponent,
    ToolbarBindingDirective,
    ToolbarItemComponent,
    ToolboxComponent,

    ...IGO_TOOLS
  ],
  declarations: [
    ToolbarComponent,
    ToolbarBindingDirective,
    ToolbarItemComponent,
    ToolboxComponent,

    ...IGO_TOOLS
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  entryComponents: IGO_TOOLS
})
export class IgoToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoToolModule,
      providers: [
        ToolService
      ]
    };
  }
}
