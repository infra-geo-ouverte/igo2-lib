import { Injectable } from '@angular/core';

import LegendRenderer from 'geostyler-legend/dist/LegendRenderer/LegendRenderer';
import { OlStyleParser as OpenLayersParser } from 'geostyler-openlayers-parser';
import {
  Style as GeostylerStyle,
  IconSymbolizer,
  LineSymbolizer,
  MarkSymbolizer,
  WriteStyleResult
} from 'geostyler-style';
import { Observable, from, map, tap } from 'rxjs';

import { StyleSourceType } from '../shared';
import { GeostylerLegendType } from './geostyler.enum';

@Injectable({
  providedIn: 'root'
})
export class GeostylerService {
  /**
   * Create a style based on a object as follow.
   * Due to the legend renderer limitation, the symbolizers have a size limit in the legend.
   * The legend will not affect the symbolizer size data, only on the display will it hava a limit.
   *
   * ## Feature styles
   *
   *       {
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
   *
   * @param Observable geostyler WriteStyleResult
   * @returns
   */
  public geostylerToOl(options: GeostylerStyle): Observable<WriteStyleResult> {
    return this.geostylerTo(options, StyleSourceType.OpenLayers);
  }

  private geostylerTo(
    options: GeostylerStyle,
    destStyle: StyleSourceType
  ): Observable<WriteStyleResult> {
    let parser;
    if (destStyle === StyleSourceType.OpenLayers) {
      parser = new OpenLayersParser();
    }
    if (parser) {
      return from(parser.writeStyle(options)).pipe(
        tap((res) => this.handleWarningsAndError(res))
      );
    }
  }

  public geostylerStyleToLegend(
    style: GeostylerStyle,
    type: GeostylerLegendType = GeostylerLegendType.SVG,
    width?: number,
    height?: number
  ): Observable<string> {
    return this.geostylerStylesToLegend([style], type, width, height);
  }

  public geostylerStylesToLegend(
    styles: GeostylerStyle[],
    type: GeostylerLegendType = GeostylerLegendType.SVG,
    width?: number,
    height?: number
  ): Observable<string> {
    const layerDescriptors: GeostylerStyle[] =
      this.transferLayersToLegend(styles);

    const nbOfRules = styles.reduce(
      (partialSum, style) => partialSum + style.rules.length,
      0
    );
    const nbOfNames = styles.reduce(
      (partialSum, style) => (partialSum + style.name?.length ? 1 : 0),
      0
    );
    const heightByName = 30;
    const heightByRule = 30;

    const computedHeightByStyles =
      nbOfNames * heightByName + nbOfRules * heightByRule;

    const renderer = new LegendRenderer({
      maxColumnWidth: 300,
      maxColumnHeight: 300,
      overflow: 'auto',
      styles: layerDescriptors,
      size: [width ?? 300, height ?? computedHeightByStyles],
      hideRect: true
    });
    return from(renderer.renderAsImage('svg')).pipe(
      map((r: Element) => {
        const serializer = new XMLSerializer();
        const svgXmlString = serializer.serializeToString(r);
        if (type === GeostylerLegendType.SVG) {
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

  private transferLayersToLegend(styles: GeostylerStyle[]) {
    const _styles = [...styles];
    const layerDescriptorsList: GeostylerStyle[] = [];
    _styles.forEach((_stylesItem) => {
      const descriptorLayerRulesAdapted = [];
      let descriptorLayerName = _stylesItem.name;
      _stylesItem.rules.map((styleRule) => {
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
        descriptorLayerRulesAdapted.push({
          name: styleRule.name,
          symbolizers: styleRuleSymbolizersAdapted
        });
      });
      const styleNoRadius: any = {
        name: descriptorLayerName,
        rules: descriptorLayerRulesAdapted
      };
      layerDescriptorsList.push(styleNoRadius);
    });
    return layerDescriptorsList;
  }

  private handleWarningsAndError(writeStyleResult: WriteStyleResult) {
    if (writeStyleResult?.warnings) {
      console.warn(writeStyleResult.warnings);
    }
    if (writeStyleResult?.errors) {
      console.error(writeStyleResult.errors);
    }
    if (writeStyleResult?.unsupportedProperties) {
      console.warn(writeStyleResult.unsupportedProperties);
    }
  }
}
