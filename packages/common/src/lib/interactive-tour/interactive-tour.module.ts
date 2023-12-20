import { NgModule } from '@angular/core';

import { InteractiveTourComponent } from './interactive-tour.component';
import { InteractiveTourLoader } from './interactive-tour.loader';
import { InteractiveTourService } from './interactive-tour.service';

@NgModule({
  imports: [InteractiveTourComponent],
  exports: [InteractiveTourComponent],
  providers: [InteractiveTourService, InteractiveTourLoader]
})
export class IgoInteractiveTourModule {}
