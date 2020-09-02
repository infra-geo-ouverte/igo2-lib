import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'igo-json-dialog',
  templateUrl: './json-dialog.component.html'
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
