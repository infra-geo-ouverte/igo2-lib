import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'igo-bookmark-dialog',
  templateUrl: './bookmark-dialog.component.html'
})
export class BookmarkDialogComponent {
  public title: string;

  constructor(public dialogRef: MatDialogRef<BookmarkDialogComponent>) {}
}
