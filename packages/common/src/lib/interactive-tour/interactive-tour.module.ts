import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule } from '@igo2/core';
import { InteractiveTourService } from './interactive-tour.service';
import { InteractiveTourComponent } from './interactive-tour.component';
import { InteractiveTourLoader } from './interactive-tour.loader';

@NgModule({
  declarations: [InteractiveTourComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    IgoLanguageModule
  ],
  providers: [InteractiveTourService, InteractiveTourLoader],
  exports: [InteractiveTourComponent]
})
export class IgoInteractiveTourModule {}
