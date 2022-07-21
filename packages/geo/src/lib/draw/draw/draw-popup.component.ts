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
  @Input() labelFlag: LabelType = LabelType.Predefined;
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
      
      this.currentLabel = this.data.olGeometry.get('draw');

      if (this.data.olGeometry instanceof OlFeature){
        this.olGeometryType = this.data.olGeometry.getGeometry().getType();
        this.coordinates = '(' + this.data.olGeometry.get('latitude').toFixed(4) + ', ' 
          + this.data.olGeometry.get('longitude').toFixed(4) + ')';
      }
      else{
        this.olGeometryType = this.data.olGeometry.getType();
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
    console.log(this.builtInLabelType);
    if(this.builtInLabelType === undefined && this.labelFlag === LabelType.Predefined){
      this.dialogRef.close();
    }
    else{
      this.dialogRef.close(labelString);
    }
  }
  onLabelTypeChange(labelType: LabelType){
    this.labelFlag = labelType;
    this.builtInLabelType = undefined;
  }
  onBuiltInLabelChange(builtInLabelType: BuiltInLabelType){
    this.builtInLabelType = builtInLabelType;
  }

  getLabel(){
    if (this.labelFlag === LabelType.Predefined){
      return this.coordinates;
    }
    else{
      return this.currentLabel? this.currentLabel: '';
    }
  }
  get arrayBuiltInType(): string[]{
    return Object.values(BuiltInLabelType);
  }

  optionAvailable(currentOption: BuiltInLabelType){
    switch(this.olGeometryType){
      case GeometryType.Point:
        if (currentOption === BuiltInLabelType.Coordinates){
          return false;
        }
        return true;
      case GeometryType.LineString:
        if (currentOption === BuiltInLabelType.Length){
          return false;
        }
        return true;
      case GeometryType.Polygon:
        if (currentOption === BuiltInLabelType.Coordinates){
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}
