import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelComponent } from './panel.component';
import { MatIconModule } from '@angular/material';
import { InteractiveTourService } from './../interactive-tour/interactive-tour.service';
import { InteractiveTourModule } from './../interactive-tour/interactive-tour.module';

@NgModule({
  imports: [
    MatIconModule,
    CommonModule,
    InteractiveTourModule
  ],
  exports: [
    PanelComponent
  ],
  declarations: [
    PanelComponent
  ],
  providers: [InteractiveTourService]

})
export class IgoPanelModule {}
