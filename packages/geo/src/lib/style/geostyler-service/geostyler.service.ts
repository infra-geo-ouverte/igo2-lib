import { Injectable } from '@angular/core';
import { OlStyleParser as OpenLayersParser } from 'geostyler-openlayers-parser';
import LegendRenderer from 'geostyler-legend/dist/LegendRenderer/LegendRenderer';

import { Style as GeoStylerStyle, WriteStyleResult } from 'geostyler-style';
import { Observable, from, map } from 'rxjs';
import { StyleSourceType } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class GeostylerStyleService {
  /**
   * Create a style based on a object as
   * "igoStyle": {
   *       "geoStyler": {
   *         "name": "GeoStyler Test",
   *         "symbolizers":[
   *           {
   *           "kind": "Fill",
   *           "color": "#ff0000",
   *           "width": 5
   *           }
   *         ],
   *         "scaleDenominator": {
   *           "min": 50,
   *           "max": 200
   *         }
   *       }
   *     }
   *
   * @param options
   * @returns
   */
  geostylerToOl(options: GeoStylerStyle): Observable<WriteStyleResult> {
    return this.geostylerTo(options, StyleSourceType.OpenLayers);
  }
  private geostylerTo(
    options: GeoStylerStyle,
    destStyle: StyleSourceType
  ): Observable<WriteStyleResult> {
    let parser: OpenLayersParser; // Ajouter les autres parser géré OU créer un type
    if (destStyle === StyleSourceType.OpenLayers) {
      parser = new OpenLayersParser();
    } else if (destStyle === StyleSourceType.HoverStyle) {
      parser = new OpenLayersParser();
    }
    if (parser) {
      return from(parser.writeStyle(options));
    }
  }

  public getStylerStyleToLegend(
    type: string, // todo enum a faire
    styles: GeoStylerStyle[],
    width: number = 300,
    height: number = 300
  ): Observable<string> {
    // todo define height automatically?
    const renderer = new LegendRenderer({
      maxColumnWidth: 300,
      maxColumnHeight: 300,
      overflow: 'auto',
      styles,
      size: [width, height],
      hideRect: true
    });
    return from(renderer.renderAsImage('svg')).pipe(
      map((r: Element) => {
        const serializer = new XMLSerializer();
        const svgXmlString = serializer.serializeToString(r);
        if (type === 'svg') {
          return svgXmlString;
        } else {
          const blob = new Blob([svgXmlString], {
            type: 'image/svg+xml'
          });
          const urlCreator = window.URL;
          return urlCreator.createObjectURL(blob);
        }
      })
    );
  }
  private hoverStyleToGeostyler() {}
}
