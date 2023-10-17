import { Injectable } from '@angular/core';

import OlPoint from 'ol/geom/Point';
import { ProjectionLike, transform } from 'ol/proj';
import * as OlStyle from 'ol/style';

import { FontType } from '../shared/font.enum';

@Injectable({
  providedIn: 'root'
})
export class DrawStyleService {
  private fillColor = 'rgba(255,255,255,0.4)';
  private strokeColor = 'rgba(143,7,7,1)';
  private strokeWidth: number = 1;
  private labelsAreShown = true;
  private icon: string;
  private fontSize: string = '15';
  private fontStyle: string = FontType.Arial.toString();
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor() {}

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

  getOffsetX(): number {
    return this.offsetX;
  }

  setOffsetX(offsetX: number) {
    this.offsetX = offsetX;
  }

  getOffsetY(): number {
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
    proj: ProjectionLike,
    icon?: string
  ): OlStyle.Style {
    let style;
    let labelsAreOffset: boolean = false;
    const geom = feature.getGeometry();

    if (geom instanceof OlPoint) {
      labelsAreOffset = !labelsAreOffset;
    }
    const textToShow = labelsAreShown ? feature.get('draw') : '';
    feature.set('_mapTitle', textToShow);
    const textIgoStyleObject = {
      text: textToShow,
      stroke: {
        color: 'white',
        width: 0.75
      },
      fill: { color: 'black' },
      font: fontSizeAndStyle,
      overflow: true,
      offsetX: offsetX,
      offsetY: offsetY
    };

    let igoStyleObject;

    // if feature is a circle
    if (feature.get('rad')) {
      const coordinates = transform(
        feature.getGeometry().flatCoordinates,
        proj,
        'EPSG:4326'
      );
      const radius =
        feature.get('rad') /
        Math.cos((Math.PI / 180) * coordinates[1]) /
        resolution;
      igoStyleObject = {
        text: textIgoStyleObject,
        circle: {
          radius,
          stroke: {
            color: strokeColor ? strokeColor : this.strokeColor,
            width: this.strokeWidth
          },
          fill: {
            color: fillColor
          }
        }
      };
      feature.set('_style', igoStyleObject);

      style = new OlStyle.Style({
        text: new OlStyle.Text({
          text: textToShow,
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
          offsetY: offsetY
        }),

        image: new OlStyle.Circle({
          radius,
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
      textIgoStyleObject.offsetY = this.offsetY;
      const igoStyleObject = {
        text: textIgoStyleObject,
        stroke: {
          color: strokeColor,
          width: this.strokeWidth
        },
        fill: {
          color: fillColor
        },
        icon: {
          src: icon
        }
      };
      feature.set('_style', igoStyleObject);

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
          offsetY: offsetY
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

      textIgoStyleObject.offsetY = this.offsetY;
      const igoStyleObject = {
        text: textIgoStyleObject,
        stroke: {
          color: strokeColor,
          width: this.strokeWidth
        },
        fill: {
          color: fillColor
        },
        circle: {
          radius: 5,
          stroke: {
            color: strokeColor,
            width: this.strokeWidth
          },
          fill: {
            color: fillColor
          }
        }
      };
      feature.set('_style', igoStyleObject);

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
          offsetY: offsetY
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
