import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'igo-record-parameters',
  templateUrl: './record-parameters.component.html',
  styleUrls: ['./record-parameters.component.scss']
})
export class RecordParametersComponent{

  intervalMode: string = 'time';
  amountInput: number;
  fileName: string;

  constructor(private dialogRef: MatDialogRef<RecordParametersComponent>) { }

  getDate(dateNumber : number) {
    return (new Date(dateNumber)).toLocaleDateString();
  }

  /**
   * Returns object containing inputs from user
   */
  getInputs(): any {
    return {
      fileName: this.fileName,
      amountInput: this.amountInput,
      intervalMode: this.intervalMode,
      confirmation: false
    };
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
