import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { IgoLanguageModule } from '@igo2/core/language';

import { InputProjections } from '../../map';

@Component({
  selector: 'igo-epsg-selector-modal',
  templateUrl: './epsg-selector-modal.component.html',
  styleUrls: ['./epsg-selector-modal.component.scss'],
  imports: [
    IgoLanguageModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule
  ]
})
export class EpsgSelectorModalComponent {
  dialogRef = inject<MatDialogRef<EpsgSelectorModalComponent>>(MatDialogRef);
  data = inject<{
    fileName: string;
    projections: InputProjections[];
  }>(MAT_DIALOG_DATA);

  public selectedEpsg?: string;

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  confirm(): void {
    if (this.selectedEpsg) {
      this.dialogRef.close(this.selectedEpsg);
    }
  }
}
