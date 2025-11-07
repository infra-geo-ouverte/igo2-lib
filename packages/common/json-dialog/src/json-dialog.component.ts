import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
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
    MatDialogActions,
    MatButtonModule,
    KeyValuePipe
  ]
})
export class JsonDialogComponent {
  dialogRef = inject<MatDialogRef<JsonDialogComponent>>(MatDialogRef);

  public title: string;
  public data: any;
  public ignoreKeys: string[];

  isObject(val) {
    return typeof val === 'object' && !Array.isArray(val);
  }

  getKey(baseKey, key) {
    return (baseKey ? baseKey + '.' : '') + key;
  }
}
