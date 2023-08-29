import { Injectable } from '@angular/core';
import { OlStyleParser as OpenLayersParser } from 'geostyler-openlayers-parser';
import { Style as GeoStylerStyle, WriteStyleResult } from 'geostyler-style';
import { Observable, from } from 'rxjs';
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
  private geostylerTo(options: GeoStylerStyle, destStyle: StyleSourceType): Observable<WriteStyleResult> {
    let parser: OpenLayersParser; // Ajouter les autres parser géré OU créer un type
    if (destStyle === StyleSourceType.OpenLayers) {
      parser = new OpenLayersParser();
    }
    if (parser) {
      return from(parser.writeStyle(options));
    }
  }
}
