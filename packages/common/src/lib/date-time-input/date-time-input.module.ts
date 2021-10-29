import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

import { DateTimeInputComponent } from '../date-time-input/date-time-input.component';

@NgModule({
  declarations: [
    DateTimeInputComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule
  ],
  exports: [
    DateTimeInputComponent
  ]
})
export class DateTimeInputModule { }
