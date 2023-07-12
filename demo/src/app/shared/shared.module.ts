import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExampleModule } from '../components/example/example.module';
import { DocViewerModule } from '../components/doc-viewer/doc-viewer.module';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

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
