import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { DocViewerComponent } from './doc-viewer.component';

@NgModule({
  exports: [DocViewerComponent],
  imports: [CommonModule, MatCardModule, DocViewerComponent]
})
export class DocViewerModule {}
