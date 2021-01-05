import { Injectable } from '@angular/core';

import * as olstyle from 'ol/style';
import { transform } from 'ol/proj';
import { MapService } from '../../map/shared/map.service';

@Injectable({
    providedIn: 'root'
  })
export class DrawStyleService {

    private fillColor: string = 'rgba(255,255,255,0.4)';
    private strokeColor: string = 'rgba(51,153,204,1)';
    private drawCounter: number = 1;
    private toggleLabel = true


    constructor(
      private mapService: MapService
    ) {
    }

    getFill(): string {
        return this.fillColor;
    }

    setFill(fillColor: string) {
        this.fillColor = fillColor;
    }

    getStroke(): string {
        return this.strokeColor;
    }

    setStroke(strokeColor: string) {
        this.strokeColor = strokeColor;
    }

    getDrawCount() {
      return this.drawCounter;
    }
    
    getToggleLabel() {
      return this.toggleLabel;
    }

    switchLabel() {
      this.toggleLabel = !this.toggleLabel;
    }

    raiseDrawCounter() {
      this.drawCounter = this.drawCounter + 1;
    }

    createDrawLayerStyle(feature, resolution, label?: boolean): olstyle.Style {
      let style;
      const proj = this.mapService.getMap().ol.getView().getProjection().getCode();
      if (feature.get('radius') !== undefined) {
        const coordinates = transform(feature.getGeometry().flatCoordinates, proj, 'EPSG:4326');
        style = [ 
          new olstyle.Style({
            text: new olstyle.Text({
              text: label? feature.get('draw') : '',
              stroke: new olstyle.Stroke({
                color: 'white',
                width: 0.75
              }),
              fill: new olstyle.Fill({
                color: 'black'
              }),
              font: '20px sans-serif',
              overflow: true
            }),
            image: new olstyle.Circle({
              radius: feature.get('radius') /
              Math.cos((Math.PI / 180) * coordinates[1]) /
              resolution,
              stroke: new olstyle.Stroke({
                color: this.strokeColor
              }),
              fill: new olstyle.Fill({
                color: this.fillColor
              })
            })
          })
        ];
        return style;
      } else {
        style = [ 
          new olstyle.Style({
            text: new olstyle.Text({
              text: label? feature.get('draw') : '',
              stroke: new olstyle.Stroke({
                color: 'white',
                width: 0.75
              }),
              fill: new olstyle.Fill({
                color: 'black'
              }),
              font: '20px sans-serif',
              overflow: true
            }),
            stroke: new olstyle.Stroke({
              color: this.strokeColor,
              width: 2
            }),
            fill:  new olstyle.Fill({
              color: this.fillColor
            }),
            image: new olstyle.Circle({
              radius: 5,
              stroke: new olstyle.Stroke({
                color: this.strokeColor
              }),
              fill: new olstyle.Fill({
                color: this.fillColor
              })
            })
          })
        ];
        return style;
      }
    }
}
