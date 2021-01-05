import { Component, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { MetadataOptions } from './metadata.interface';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  constructor(public dialog: MatDialog) {}

  open(metadata: MetadataOptions) {
    if (metadata.extern) {
      window.open(metadata.url, '_blank');
    } else if (!metadata.extern && metadata.abstract) {
      this.dialog.open(MetadataAbstractComponent);
    }
  }
}

@Component({
  selector: 'igo-metadata-abstract',
  templateUrl: './metadata-astract.component.html',
})
export class MetadataAbstractComponent {}
