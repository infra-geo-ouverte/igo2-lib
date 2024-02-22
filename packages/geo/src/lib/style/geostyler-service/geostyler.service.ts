import { Injectable } from '@angular/core';

import LegendRenderer from 'geostyler-legend/dist/LegendRenderer/LegendRenderer';
import { OlStyleParser as OpenLayersParser } from 'geostyler-openlayers-parser';
import {
  Style as GeoStylerStyle,
  IconSymbolizer,
  LineSymbolizer,
  MarkSymbolizer,
  WriteStyleResult
} from 'geostyler-style';
import { Observable, from, map } from 'rxjs';

import { StyleSourceType } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class GeostylerStyleService {
  /**
   * Create a style based on a object as follow.
   * Due to the legend renderer limitation, the symbolizers have a size limit in the legend.
   * The legend will not affect the symbolizer size data, only on the display will it hava a limit.
   *
   * ## Feature styles
   *
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
    type: string,
    styles: GeoStylerStyle[],
    width: number = 300,
    height: number = 300
  ): Observable<string> {
    const layerDescriptors: GeoStylerStyle[] =
      this.transferLayersToLegend(styles);
    const renderer = new LegendRenderer({
      maxColumnWidth: 300,
      maxColumnHeight: 300,
      overflow: 'auto',
      styles: layerDescriptors,
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

  private transferLayersToLegend(styles: GeoStylerStyle[]) {
    var stylesCopy = [...styles];
    const layerDescriptorsList: GeoStylerStyle[] = [];
    stylesCopy.forEach((stylesCopyItem) => {
      var DescriptorLayerRulesAdapted = [];
      let descriptorLayerName = stylesCopyItem.name;
      stylesCopyItem.rules.map((styleRule) => {
        var styleRuleSymbolizersAdapted = [];
        styleRule.symbolizers.map((styleRuleSymbolizer) => {
          switch (styleRuleSymbolizer.kind) {
            case 'Mark':
              (styleRuleSymbolizer as MarkSymbolizer).radius = 10;
              break;
            case 'Line':
              (styleRuleSymbolizer as LineSymbolizer).width = 3;
              break;
            case 'Icon':
              (styleRuleSymbolizer as IconSymbolizer).size = 15;
            default:
              break;
          }
          styleRuleSymbolizersAdapted.push(styleRuleSymbolizer);
        });
        DescriptorLayerRulesAdapted.push({
          name: styleRule.name,
          symbolizers: styleRuleSymbolizersAdapted
        });
      });
      let styleNoRadius: any = {
        name: descriptorLayerName,
        rules: DescriptorLayerRulesAdapted
      };
      layerDescriptorsList.push(styleNoRadius);
    });
    return layerDescriptorsList;
  }
}
