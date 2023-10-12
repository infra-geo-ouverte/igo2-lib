import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { DocViewerComponent } from './doc-viewer.component';

@NgModule({
  declarations: [DocViewerComponent],
  exports: [DocViewerComponent],
  imports: [CommonModule, MatCardModule]
})
export class DocViewerModule {}
