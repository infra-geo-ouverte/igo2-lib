import { NgModule } from '@angular/core';
import {
  MatIconModule,
  MatButtonModule,
  MatTooltipModule
} from '@angular/material';
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
