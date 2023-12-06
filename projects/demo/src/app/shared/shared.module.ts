import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DocViewerModule } from '../components/doc-viewer/doc-viewer.module';
import { ExampleModule } from '../components/example/example.module';

@NgModule({
  declarations: [],
  exports: [
    CommonModule,
    ExampleModule,
    DocViewerModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule
  ],
  imports: [CommonModule]
})
export class SharedModule {}
