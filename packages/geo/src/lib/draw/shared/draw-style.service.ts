import { Injectable } from '@angular/core';

import * as OlStyle from 'ol/style';
import OlPoint from 'ol/geom/Point';
import { transform } from 'ol/proj';
import { MapService } from '../../map/shared/map.service';
import { FontType } from './draw.enum';

@Injectable({
  providedIn: 'root'
})
export class DrawStyleService {
  private fillColor = 'rgba(255,255,255,0.4)';
  private strokeColor = 'rgba(143,7,7,1)';
  private strokeWidth: number = 1;
  private labelsAreShown = true;
  private icon: string;
  private fontSize: string = '20';
  private fontStyle: string = FontType.Arial.toString();
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor(
    private mapService: MapService
  ) {}

  getFillColor(): string {
    return this.fillColor;
  }

  setFillColor(fillColor: string) {
    this.fillColor = fillColor;
  }

  getStrokeColor(): string {
    return this.strokeColor;
  }

  setStrokeColor(strokeColor: string) {
    this.strokeColor = strokeColor;
  }

  getStrokeWidth(): number {
    return this.strokeWidth;
  }

  getLabelsAreShown() {
    return this.labelsAreShown;
  }

  toggleLabelsAreShown() {
    this.labelsAreShown = !this.labelsAreShown;
  }

  setIcon(icon: string) {
    this.icon = icon;
  }

  getIcon() {
    return this.icon;
  }

  // To edit the label of drawing
  getFontSize() {
    return this.fontSize;
  }

  setFontSize(fontSize: string) {
    this.fontSize = fontSize;
  }

  getFontStyle() {
    return this.fontStyle;
  }

  setFontStyle(fontStyle: string) {
    this.fontStyle = fontStyle;
  }

  getOffsetX() {
    return this.offsetX;
  }

  setOffsetX(offsetX: number) {
    this.offsetX = offsetX;
  }

  getOffsetY() {
    return this.offsetY;
  }

  setOffsetY(offsetY: number) {
    this.offsetY = offsetY;
  }

  createIndividualElementStyle(
    feature,
    resolution,
    labelsAreShown: boolean,
    fontSizeAndStyle: string,
    fillColor: string,
    strokeColor: string,
    offsetX: number,
    offsetY: number,
    icon?: string
  ): OlStyle.Style {
    let style;
    let labelsAreOffset: boolean = false;
    const proj = this.mapService.getMap().projection;
    const geom = feature.getGeometry();

    if (geom instanceof OlPoint) {
      labelsAreOffset = !labelsAreOffset;
    }

    // if feature is a circle
    if (feature.get('rad')) {
      const coordinates = transform(feature.getGeometry().flatCoordinates, proj, 'EPSG:4326');

      style = new OlStyle.Style({
        text: new OlStyle.Text({
          text: labelsAreShown ? feature.get('draw') : '',
          stroke: new OlStyle.Stroke({
            color: 'white',
            width: 0.75
          }),
          fill: new OlStyle.Fill({
            color: 'black'
          }),

          font: fontSizeAndStyle,
          overflow: true,
          offsetX: offsetX,
          offsetY: offsetY ? offsetY : this.offsetY
        }),

        image: new OlStyle.Circle({
          radius: feature.get('rad') / Math.cos((Math.PI / 180) * coordinates[1]) / resolution,
          stroke: new OlStyle.Stroke({
            color: strokeColor ? strokeColor : this.strokeColor,
            width: this.strokeWidth
          }),
          fill: new OlStyle.Fill({
            color: fillColor
          })
        })
      });
      return style;

      // if feature is an icon
    } else if (icon) {
      this.offsetY = -26;
      style = new OlStyle.Style({
        text: new OlStyle.Text({
          text: labelsAreShown ? feature.get('draw') : '',
          stroke: new OlStyle.Stroke({
            color: 'white',
            width: 0.75
          }),
          fill: new OlStyle.Fill({
            color: 'black'
          }),
          font: fontSizeAndStyle,
          overflow: true,
          offsetX: offsetX,
          offsetY: offsetY ? offsetY : this.offsetY
        }),

        stroke: new OlStyle.Stroke({
          color: strokeColor,
          width: this.strokeWidth
        }),

        fill: new OlStyle.Fill({
          color: fillColor
        }),

        image: new OlStyle.Icon({
          src: icon
        })
      });
      return style;

      // if feature is a point, a linestring or a polygon
    } else {
      this.offsetY = labelsAreOffset ? -15 : 0;
      style = new OlStyle.Style({
        text: new OlStyle.Text({
          text: labelsAreShown ? feature.get('draw') : '',
          stroke: new OlStyle.Stroke({
            color: 'white',
            width: 0.75
          }),
          fill: new OlStyle.Fill({
            color: 'black'
          }),
          font: fontSizeAndStyle,
          overflow: true,

          offsetX: offsetX,
          offsetY: offsetY ? offsetY : this.offsetY
        }),

        stroke: new OlStyle.Stroke({
          color: strokeColor,
          width: this.strokeWidth
        }),

        fill: new OlStyle.Fill({
          color: fillColor
        }),

        image: new OlStyle.Circle({
          radius: 5,
          stroke: new OlStyle.Stroke({
            color: strokeColor,
            width: this.strokeWidth
          }),
          fill: new OlStyle.Fill({
            color: fillColor
          })
        })
      });
      return style;
    }
  }
}
