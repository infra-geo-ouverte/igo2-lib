import { ModuleWithProviders, NgModule } from '@angular/core';

import { IgoSearchModule } from '../search/search.module';
import { DirectionsButtonsComponent } from './directions-buttons/directions-buttons.component';
import { DirectionsInputsComponent } from './directions-inputs/directions-inputs.component';
import { DirectionsResultsComponent } from './directions-results/directions-results.component';
import { DirectionsComponent } from './directions.component';
import { provideDirectionsSourceService } from './shared/directions-source.service';

@NgModule({
  imports: [
    IgoSearchModule.forRoot(),
    DirectionsComponent,
    DirectionsInputsComponent,
    DirectionsButtonsComponent,
    DirectionsResultsComponent
  ],
  exports: [
    DirectionsComponent,
    DirectionsInputsComponent,
    DirectionsButtonsComponent,
    DirectionsResultsComponent
  ],
  providers: [provideDirectionsSourceService()]
})
export class IgoDirectionsModule {
  /**
   * @deprecated it has no effect
   */
  static forRoot(): ModuleWithProviders<IgoDirectionsModule> {
    return {
      ngModule: IgoDirectionsModule
    };
  }
}
