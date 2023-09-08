import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExampleViewerComponent } from './example-viewer/example-viewer.component';
import { ExampleSeeCodeComponent } from './example-see-code/example-see-code.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ExampleViewerComponent, ExampleSeeCodeComponent],
  exports: [ExampleViewerComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class ExampleModule { }
