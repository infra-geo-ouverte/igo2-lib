import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';
import { IgoContextModule } from '../context/module';
import { IgoFeatureModule } from '../feature';
import { IgoFilterModule } from '../filter';
import { IgoLayerModule } from '../layer';
import { IgoPrintModule } from '../print';

import { ToolService } from './shared';
import { ToolbarComponent, ToolbarBindingDirective } from './toolbar';
import { ToolbarItemComponent } from './toolbar-item';
import { ToolboxComponent } from './toolbox';

import { ContextManagerToolComponent, MapDetailsToolComponent,
         SearchResultsToolComponent, PrintToolComponent,
         TimeAnalysisToolComponent } from './tools';

const IGO_TOOLS = [
  ContextManagerToolComponent,
  MapDetailsToolComponent,
  SearchResultsToolComponent,
  PrintToolComponent,
  TimeAnalysisToolComponent
];

@NgModule({
  imports: [
    IgoSharedModule,
    IgoContextModule,
    IgoFeatureModule,
    IgoFilterModule,
    IgoLayerModule,
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

export * from './shared';
export * from './toolbar';
export * from './toolbar-item';
export * from './toolbox';

export * from './tools'
