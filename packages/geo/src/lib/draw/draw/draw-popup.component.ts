import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LabelType, GeometryType, BuiltInLabelType } from '../shared/draw.enum';
import { transform } from 'ol/proj';
import { IgoMap } from '../../map/shared';
import OlFeature from 'ol/Feature';


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
  @Input() labelFlag: LabelType = LabelType.BuiltIn;
  @Input() builtInLabelType: BuiltInLabelType
  public labelType = LabelType;
  public geometryType = GeometryType;

  public builtInType = BuiltInLabelType;
  public currentLabel: string;
  public coordinates: string;
  public olGeometryType: GeometryType = undefined;

  constructor(
    public dialogRef: MatDialogRef<DrawPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { olGeometry: any, map: IgoMap }
    ){
      this.olGeometryType = this.data.olGeometry.getType();
      this.currentLabel = this.data.olGeometry.get('draw');

      if (this.data.olGeometry instanceof OlFeature){
        this.coordinates = '(' + this.data.olGeometry.get('latitude').toFixed(4) + ', ' 
          + this.data.olGeometry.get('longitude').toFixed(4) + ')';
      }
      else{
        const projection = this.data.map.ol.getView().getProjection();
        let point4326 = transform(
          this.data.olGeometry.getFlatCoordinates(),
          projection,
          'EPSG:4326'
        );
        this.coordinates =
          '(' + point4326[1].toFixed(4) + ', ' + point4326[0].toFixed(4) + ')';
      }
    }
  cancelDrawing() {
    this.dialogRef.close();
  }
  confirm(labelString: string) {
    this.confirmFlag = true;
    this.dialogRef.close(labelString);
  }
  onLabelTypeChange(labelType: LabelType){
    this.labelFlag = labelType;
  }
  onBuiltInLabelChange(builtInLabelType: BuiltInLabelType){
    this.builtInLabelType = builtInLabelType;
  }

  getLabel(){
    if (this.labelFlag === LabelType.BuiltIn){
      return this.coordinates;
    }
    else{
      return this.currentLabel? this.currentLabel: '';
    }
  }
  get arrayBuiltInType(): string[]{
    return Object.values(BuiltInLabelType);
  }
}
