import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ExampleSeeCodeComponent } from './example-see-code/example-see-code.component';
import { ExampleViewerComponent } from './example-viewer/example-viewer.component';

@NgModule({
  exports: [ExampleViewerComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    ExampleViewerComponent,
    ExampleSeeCodeComponent
  ]
})
export class ExampleModule {}
