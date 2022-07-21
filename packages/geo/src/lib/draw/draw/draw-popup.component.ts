import { Component, Inject, Input } from '@angular/core';
import { LanguageService } from '@igo2/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GeometryType, LabelType } from '../shared/draw.enum';
import { transform } from 'ol/proj';
import { IgoMap } from '../../map/shared';
import OlFeature from 'ol/Feature';
import { measureOlGeometryLength } from '../../measure/shared/measure.utils';


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
  
  public geometryType = GeometryType;
  public labelType = LabelType;
  public currentLabel: string;
  public coordinates: string;
  public olGeometryType: GeometryType = undefined;


  constructor(
    private languageService: LanguageService,
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
    if(this.labelFlag === LabelType.Predefined){
      this.dialogRef.close();
    }
    else{
      this.dialogRef.close(labelString);
    }
  }
  onLabelTypeChange(labelType: LabelType){
    this.labelFlag = labelType;
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
    let arrayBILabels = [];
    for (const labelType of Object.values(LabelType)){
      if (labelType !== LabelType.Custom && labelType !== LabelType.Predefined){
        arrayBILabels.push(labelType);
      }
    }
    return arrayBILabels;
  }

  noLabelButton(){
    if (this.labelFlag === LabelType.Predefined){
      return this.languageService.translate.instant('igo.geo.draw.noLabel');
    }
    return 'OK'
  }

  optionAvailable(currentOption: LabelType){
    switch(this.olGeometryType){
      case GeometryType.Point:
        if (currentOption === LabelType.Coordinates){
          return false;
        }
        return true;
      case GeometryType.LineString:
        if (currentOption === LabelType.Length){
          return false;
        }
        return true;
      case GeometryType.Polygon:
        if (currentOption === LabelType.Coordinates){
          return true;
        }
        return false;
      default:
        return false;
    }
  }


  getLengthOfLine(olGeometry:any){
    measureOlGeometryLength(olGeometry, this.data.map.ol.getView().getProjection().getCode())
  }
}
