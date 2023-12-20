import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core';

import { InteractiveTourComponent } from './interactive-tour.component';
import { InteractiveTourLoader } from './interactive-tour.loader';
import { InteractiveTourService } from './interactive-tour.service';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    IgoLanguageModule,
    InteractiveTourComponent
  ],
  providers: [InteractiveTourService, InteractiveTourLoader],
  exports: [InteractiveTourComponent]
})
export class IgoInteractiveTourModule {}
