import { Component, Inject, Input } from '@angular/core';
import { LanguageService } from '@igo2/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { CoordinatesUnit, GeometryType, LabelType } from '../shared/draw.enum';
import { transform } from 'ol/proj';
import { IgoMap, roundCoordTo } from '../../map/shared';
import OlFeature from 'ol/Feature';
import {
  measureOlGeometryLength,
  measureOlGeometryArea,
  metersToUnit,
  squareMetersToUnit
} from '../../measure/shared/measure.utils';
import {
  MeasureLengthUnit,
  MeasureLengthUnitAbbreviation,
  MeasureAreaUnit,
  MeasureAreaUnitAbbreviation,
} from '../../measure/shared/measure.enum';

import {fromCircle} from 'ol/geom/Polygon';
import { getLength } from 'ol/sphere';
import Circle from 'ol/geom/Circle';
import { DDtoDMS } from '../shared/draw.utils';


@Component({
  selector: 'igo-draw-popup-component',
  templateUrl: './draw-popup.component.html',
  styleUrls: ['./draw-popup.component.scss']
  })
export class DrawPopupComponent {
  @Input() confirmFlag: boolean = false;
  @Input() labelFlag: LabelType | [LabelType, LabelType] = LabelType.Custom;
  @Input() coordinatesMeasureUnit: CoordinatesUnit;
  @Input() lengthMeasureUnit: MeasureLengthUnit;
  @Input() areaMeasureUnit: MeasureAreaUnit;

  public geometryType = GeometryType;
  public labelType = LabelType;
  public arrayBuiltInType: any[] = [];

  public currentLabel: string;
  public currentCoordinates: string;
  public currentArea: string;
  public currentLength: string;

  public olGeometryType: GeometryType = undefined;
  public lengthInMeters: string;
  public areaInMetersSquare: string;
  public coordinatesInDD: string;
  public currentCoordinatesUnit: string;

  private longlatDD: [number, number];
  private labelLength: number;

  public polygonCheck = 0; // Count for polygon label types checkboxes

  constructor(
    private languageService: LanguageService,
    public dialogRef: MatDialogRef<DrawPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { olGeometry: any, map: IgoMap }
    ) {
      this.currentLabel = this.data.olGeometry.get('draw');
      this.labelLength = this.currentLabel ? this.currentLabel.length: 0;
      let olGeometry;

      const projection = this.data.map.ol.getView().getProjection();

      if(this.data.olGeometry instanceof OlFeature) {
        if (this.data.olGeometry.get('rad')){
          const longitudeLatitude = [this.data.olGeometry.get('longitude'), this.data.olGeometry.get('latitude')];
          this.olGeometryType = GeometryType.Circle;
          olGeometry = new Circle(longitudeLatitude, this.data.olGeometry.get('rad'));
        }
        else{
          this.olGeometryType = this.data.olGeometry.getGeometry().getType();
          olGeometry = this.data.olGeometry.get('geometry');
        }
      }
      else{
        this.olGeometryType = this.data.olGeometry.getType();
        olGeometry = this.data.olGeometry;
      }

      if (this.olGeometryType === GeometryType.Point || this.olGeometryType === GeometryType.Circle){
        if(this.data.olGeometry instanceof OlFeature){
          let longitude = this.data.olGeometry.get('longitude');
          let latitude = this.data.olGeometry.get('latitude');
          this.longlatDD = roundCoordTo([longitude, latitude], 5);
          this.coordinatesInDD = '(' + latitude + ', '
          + longitude + ')';
        }
        else {
          let point4326 = transform(
            this.data.olGeometry.getFlatCoordinates(),
            projection,
            'EPSG:4326'
          );
          this.longlatDD = roundCoordTo([point4326[0], point4326[1]], 5);
          this.coordinatesInDD =
            '(' + this.longlatDD[1] + ', ' + this.longlatDD[0] + ')';
        }
        this.currentCoordinates = this.coordinatesInDD;
      }
      if (this.olGeometryType === GeometryType.LineString){
        this.lengthInMeters = measureOlGeometryLength(olGeometry, projection.getCode()).toFixed(2);
        this.currentLength = this.lengthInMeters;
      }
      else if (this.olGeometryType === GeometryType.Polygon){
        this.lengthInMeters = measureOlGeometryLength(olGeometry, projection.getCode()).toFixed(2);
        this.currentLength = this.lengthInMeters;
        this.areaInMetersSquare = measureOlGeometryArea(olGeometry,projection.getCode()).toFixed(2);
        this.currentArea = this.areaInMetersSquare;
      }
      else if(this.olGeometryType === GeometryType.Circle){
        let circularPolygon = fromCircle(olGeometry, 10000);
        const radius = this.getRadius(circularPolygon);
        this.lengthInMeters = radius.toFixed(2);
        this.currentLength = this.lengthInMeters;
        this.areaInMetersSquare = measureOlGeometryArea(circularPolygon,projection.getCode()).toFixed(2);
        this.currentArea = this.areaInMetersSquare;
      }

      if (data.olGeometry.get('labelType') === LabelType.Coordinates) {
        this.onLabelTypeChange(LabelType.Predefined);
        this.onLabelTypeChange(LabelType.Coordinates, true);
        this.coordinatesMeasureUnit = data.olGeometry.get('measureUnit');
      } else if (data.olGeometry.get('labelType') === LabelType.Length) {
        this.onLabelTypeChange(LabelType.Predefined);
        this.onLabelTypeChange(LabelType.Length, true);
        this.lengthMeasureUnit = data.olGeometry.get('measureUnit');
      } else if (data.olGeometry.get('labelType') === LabelType.Area) {
        this.onLabelTypeChange(LabelType.Predefined);
        this.onLabelTypeChange(LabelType.Area, true);
        this.areaMeasureUnit = data.olGeometry.get('measureUnit');
      } else if (data.olGeometry.get('labelType')?.length === 2) {
        this.onLabelTypeChange(LabelType.Predefined);
        this.onLabelTypeChange(LabelType.Length, true);
        this.onLabelTypeChange(LabelType.Area, true);
        this.lengthMeasureUnit = data.olGeometry.get('measureUnit')[0];
        this.areaMeasureUnit = data.olGeometry.get('measureUnit')[1];
      }
      this.buildArrayType();
    }

  /**
   * HTML Interactions
   */

  cancelDrawing() {
    this.dialogRef.close();
  }

  confirm(input?: string) {
    this.confirmFlag = true;
    if(this.labelFlag === LabelType.Predefined){
      this.dialogRef.close();
    }
    else if (this.labelFlag === LabelType.Custom){
      this.dialogRef.close({
        label: input
      });
    }
    else if(this.labelFlag === LabelType.Coordinates){
      this.dialogRef.close({
        label: this.currentCoordinates,
        measureUnit: this.coordinatesMeasureUnit
      });
    }
    else if (this.olGeometryType === GeometryType.Polygon) {
      if (this.polygonCheck === 2) {
        this.labelFlag = [LabelType.Length, LabelType.Area];
        this.dialogRef.close({
          label: 'P: ' + this.currentLength + ' ' + MeasureLengthUnitAbbreviation[MeasureLengthUnit.Meters] + '\n'
          + this.languageService.translate.instant('igo.geo.draw.labelType.A') + this.currentArea + ' ' +
          MeasureAreaUnitAbbreviation[MeasureAreaUnit.SquareMeters], measureUnit: [this.lengthMeasureUnit, this.areaMeasureUnit]
        });
      } else {
        this.labelFlag === LabelType.Length ?
        this.dialogRef.close({
          label: 'P: ' + this.currentLength + ' ' + MeasureLengthUnitAbbreviation[this.lengthMeasureUnit],
          measureUnit: this.lengthMeasureUnit
        }) :
        this.dialogRef.close({
          label: this.currentArea + ' ' + MeasureAreaUnitAbbreviation[this.areaMeasureUnit],
          measureUnit: this.areaMeasureUnit
        });
      }
    }
    else if (this.labelFlag === LabelType.Length){
      if (this.olGeometryType === GeometryType.Circle){
        this.dialogRef.close({
          label: 'R: ' + this.currentLength + ' ' + MeasureLengthUnitAbbreviation[this.lengthMeasureUnit],
          measureUnit: this.lengthMeasureUnit
        });
      }
      else if (this.olGeometryType === GeometryType.LineString) {
        this.dialogRef.close({
          label: this.currentLength + ' ' + MeasureLengthUnitAbbreviation[this.lengthMeasureUnit],
          measureUnit: this.lengthMeasureUnit
        });
      }
    }
    else if (this.labelFlag === LabelType.Area){
      this.dialogRef.close({
        label: this.currentArea + ' ' + MeasureAreaUnitAbbreviation[this.areaMeasureUnit],
        measureUnit: this.areaMeasureUnit
      });
    }
  }

  onLabelTypeChange(labelType: LabelType, checked?: boolean){
    if (labelType !== LabelType.Predefined &&
      labelType !== LabelType.Custom &&
      this.olGeometryType === GeometryType.Polygon) {
        this.arrayBuiltInType.find(type => type.value === labelType) ?
          this.arrayBuiltInType.find(type => type.value === labelType).checked = checked : this.labelFlag = undefined;
        checked ? this.labelFlag = labelType : this.labelFlag = this.arrayBuiltInType.find(type => type.checked)?.value;
    } else {
      this.labelFlag = labelType;
    }

    if (labelType === LabelType.Predefined){
      if (this.olGeometryType === GeometryType.Point ){
        this.labelFlag = LabelType.Coordinates;
        this.currentCoordinates = this.coordinatesInDD;
        this.coordinatesMeasureUnit = CoordinatesUnit.DecimalDegree;
      }
      else if (this.olGeometryType === GeometryType.LineString){
        this.labelFlag = LabelType.Length;
        this.currentLength = this.lengthInMeters;
        this.lengthMeasureUnit = MeasureLengthUnit.Meters;
      }
    }
    else if (labelType === LabelType.Area){
      this.currentArea = this.areaInMetersSquare;
      this.areaMeasureUnit = MeasureAreaUnit.SquareMeters;
    }
    else if (labelType === LabelType.Length){
      this.currentLength = this.lengthInMeters;
      this.lengthMeasureUnit = MeasureLengthUnit.Meters;
    }
    else if (this.labelFlag === LabelType.Coordinates){
      this.currentCoordinates = this.coordinatesInDD;
      this.coordinatesMeasureUnit = CoordinatesUnit.DecimalDegree;
    }

    const labeltypes = [this.labelType.Length, this.labelType.Area];
    if (
      this.olGeometryType === GeometryType.Polygon &&
      labeltypes.includes(labelType)) {
      checked ? this.polygonCheck += 1 : this.polygonCheck -= 1;;
    } else {
      this.polygonCheck = 0;
    }
  }

  onChangeLengthUnit(lengthUnit: MeasureLengthUnit){
    this.lengthMeasureUnit = lengthUnit;
    this.currentLength = metersToUnit(Number(this.lengthInMeters), lengthUnit).toFixed(2);
  }

  onChangeAreaUnit(areaUnit: MeasureAreaUnit){
    this.areaMeasureUnit = areaUnit;
    this.currentArea = squareMetersToUnit(Number(this.areaInMetersSquare), areaUnit).toFixed(2);
  }

  onChangeCoordinateUnit(coordinatesUnit: CoordinatesUnit){
    this.coordinatesMeasureUnit = coordinatesUnit;
    let coordinates = DDtoDMS(this.longlatDD, coordinatesUnit);
    this.currentCoordinates = '(' + coordinates[1] + ', ' + coordinates[0] + ')';
  }

  buildArrayType() {
    for (const labelType of Object.values(LabelType)){
      if (labelType !== LabelType.Custom && labelType !== LabelType.Predefined){
        this.arrayBuiltInType.push({
          value: labelType,
          checked:
            this.selectOptions(labelType) ||
            this.labelFlag === labelType ||
            (this.polygonCheck === 2 && labelType !== LabelType.Coordinates)
        });
      }
    }
  }

  noLabelButton(){
    if (this.labelFlag === LabelType.Predefined || (this.labelFlag === LabelType.Custom && this.labelLength === 0)){
      return this.languageService.translate.instant('igo.geo.draw.noLabel');
    }

    return 'OK';
  }

  get customOrPredefined(){
    if (this.labelFlag === LabelType.Custom){
      return LabelType.Custom;
    }
    return LabelType.Predefined;
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

  get allLengthUnits(): string[]{
    return Object.values(MeasureLengthUnit);
  }

  getLengthUnitEnum(lengthUnit: MeasureLengthUnit){
    return MeasureLengthUnitAbbreviation[lengthUnit];
  }

  get allAreaUnits(): string[]{
    return Object.values(MeasureAreaUnit);
  }

  get allCoordinatesUnits(): string[]{
    return Object.values(CoordinatesUnit);
  }

  getAreaUnitEnum(areaUnit: MeasureAreaUnit){
    return MeasureAreaUnitAbbreviation[areaUnit];
  }

  private getRadius(olGeometry): number{
    const length = getLength(olGeometry);
    return Number(length / (2 * Math.PI));
  }

  get lengthLabelT(){
    if (this.olGeometryType === GeometryType.Polygon){
      return this.languageService.translate.instant('igo.geo.measure.perimeter');
    }
    if (this.olGeometryType === GeometryType.Circle){
      return this.languageService.translate.instant('igo.geo.search.coordinates.radius');
    }
    return this.languageService.translate.instant('igo.geo.draw.labelType.Length');
  }

  getLabelLength(event?){
    this.labelLength = event.length;
  }

  selectOptions(option){
    if (this.olGeometryType === GeometryType.Point){
      return option === LabelType.Coordinates;
    }
    else if (this.olGeometryType === GeometryType.LineString){
      return option === LabelType.Length;
    }
  }

  getProperLengthLabel(option){
    if (option === LabelType.Length){
      if (this.olGeometryType === GeometryType.Polygon){
        return this.languageService.translate.instant('igo.geo.measure.perimeter');
      }
      if (this.olGeometryType === GeometryType.Circle){
        return this.languageService.translate.instant('igo.geo.search.coordinates.radius');
      }
      return this.languageService.translate.instant('igo.geo.draw.labelType.Length');
    }
    return this.languageService.translate.instant('igo.geo.draw.labelType.' + option);
  }


}
