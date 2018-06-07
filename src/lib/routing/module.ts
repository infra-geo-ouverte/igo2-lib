import { NgModule, ModuleWithProviders } from '@angular/core';
import { IgoSharedModule } from '../shared';
import {
  RoutingFormComponent,
  RoutingFormBindingDirective, RoutingFormService } from './routing-form';

import { RoutingService, provideRoutingSourceService } from './shared';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    RoutingFormComponent,
    RoutingFormBindingDirective
  ],
  declarations: [
    RoutingFormComponent,
    RoutingFormBindingDirective
  ]
})
export class IgoRoutingModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoRoutingModule,
      providers: [
        provideRoutingSourceService(),
        RoutingService,
        RoutingFormService
      ]
    };
  }
}
