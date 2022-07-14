import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LabelType } from '../shared/draw.enum'

export interface DialogData {
  label: string;
}

@Component({
  selector: 'igo-draw-popup-component',
  templateUrl: './draw-popup.component.html',
  styleUrls: ['./draw-popup.component.scss']
  })
export class DrawPopupComponent {
  @Input() confirmFlag: boolean = false;
  @Input() coordinatesFlag: LabelType = LabelType.Coordinates;
  public labelType = LabelType;
    
  constructor(
    public dialogRef: MatDialogRef<DrawPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentLabel: string, canUseCoordinateLabel: boolean, coordinates: string}
    ){}

  cancelDrawing() {
    this.dialogRef.close();
  }
  confirm(labelString: string) {
    this.confirmFlag = true;
    this.dialogRef.close(labelString);
  }
  onLabelTypeChange(labelType: LabelType){
    console.log(labelType);
    this.coordinatesFlag = labelType;
  }

  getLabel(){
    if (this.coordinatesFlag == LabelType.Coordinates){
      return this.data.coordinates;
    }
    else{
      return this.data.currentLabel? this.data.currentLabel: '';
    }

  }


}
