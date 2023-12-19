import { Component } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgTemplateOutlet, NgFor, NgIf, KeyValuePipe } from '@angular/common';

@Component({
    selector: 'igo-json-dialog',
    templateUrl: './json-dialog.component.html',
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, NgTemplateOutlet, NgFor, NgIf, MatDialogActions, MatButtonModule, KeyValuePipe]
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
