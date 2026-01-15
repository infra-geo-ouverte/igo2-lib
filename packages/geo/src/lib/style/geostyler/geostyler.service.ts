import { Injectable } from '@angular/core';

import { Style as OlStyle } from 'ol/style';

import { LegendRenderer } from 'geostyler-legend';
import { OlStyleParser as OpenLayersParser } from 'geostyler-openlayers-parser';
import {
  Style as GsStyle,
  IconSymbolizer,
  WriteStyleResult
} from 'geostyler-style';
import { Observable, from, map, tap } from 'rxjs';

import { OlStyleLikeOrFlatLike } from '../shared/layer/layer-style.interface';
import { GeostylerLegendType } from './geostyler.interface';

@Injectable()
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
  public geostylerToOl(options: GsStyle): Observable<WriteStyleResult> {
    const olParser = new OpenLayersParser();
    return from(olParser.writeStyle(options)).pipe(
      tap((res) => this.handleWarningsAndError(res))
    );
  }

  public olStyleToGeostyler(options: OlStyleLikeOrFlatLike): GsStyle {
    const olParser = new OpenLayersParser();
    return olParser.olStyleToGeoStylerStyle(options as OlStyle | OlStyle[]);
  }

  public geostylerStyleToLegend(
    style: GsStyle,
    type: GeostylerLegendType = 'svg',
    width?: number,
    height?: number
  ): Observable<string> {
    return this.geostylerStylesToLegend([style], type, width, height);
  }

  public geostylerStylesToLegend(
    styles: GsStyle[],
    type: GeostylerLegendType = 'svg',
    width?: number,
    height?: number
  ): Observable<string> {
    const layerDescriptors = this.transferLayersToLegend(styles);

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
      overflow: 'auto',
      styles: layerDescriptors,
      size: [width ?? 300, height ?? computedHeightByStyles],
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

  private transferLayersToLegend(styles: GsStyle[]): GsStyle[] {
    const _styles = [...styles];
    const layerDescriptorsList: GsStyle[] = [];
    _styles.forEach((_stylesItem) => {
      const descriptorLayerRulesAdapted = [];
      const descriptorLayerName = _stylesItem.name;
      _stylesItem.rules.map((styleRule) => {
        const styleRuleSymbolizersAdapted = [];
        styleRule.symbolizers.map((styleRuleSymbolizer) => {
          switch (styleRuleSymbolizer.kind) {
            case 'Icon':
              (styleRuleSymbolizer as IconSymbolizer).size = 15;
              break;
            default:
              break;
          }
          styleRuleSymbolizersAdapted.push(styleRuleSymbolizer);
        });
        descriptorLayerRulesAdapted.push({
          name: styleRule.name,
          symbolizers: styleRuleSymbolizersAdapted.filter(
            (s) => s.kind !== 'Text'
          )
        });
      });
      const styleNoRadius: GsStyle = {
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
