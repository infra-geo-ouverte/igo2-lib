import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocViewerComponent } from './doc-viewer.component';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [DocViewerComponent],
  exports: [DocViewerComponent],
  imports: [CommonModule, MatCardModule]
})
export class DocViewerModule {}
