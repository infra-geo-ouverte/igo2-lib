import { KeyValuePipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

@Component({
  selector: 'igo-json-dialog',
  templateUrl: './json-dialog.component.html',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    NgTemplateOutlet,
    NgFor,
    NgIf,
    MatDialogActions,
    MatButtonModule,
    KeyValuePipe
  ]
})
export class JsonDialogComponent {
  public title: string;
  public data: any;
  public ignoreKeys: string[];

  constructor(public dialogRef: MatDialogRef<JsonDialogComponent>) {}

  isObject(val) {
    return typeof val === 'object' && !Array.isArray(val);
  }

  getKey(baseKey, key) {
    return (baseKey ? baseKey + '.' : '') + key;
  }
}
