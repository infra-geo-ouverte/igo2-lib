import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { IgoLanguageModule } from '@igo2/core';
import { InteractiveTourService } from './interactive-tour.service';
import { InteractiveTourComponent } from './interactive-tour.component';

@NgModule({
  declarations: [InteractiveTourComponent],
  imports: [
    CommonModule,
    MatIconModule,
    IgoLanguageModule
  ],
  providers: [InteractiveTourService],
  exports: [InteractiveTourComponent]
})
export class InteractiveTourModule { }
