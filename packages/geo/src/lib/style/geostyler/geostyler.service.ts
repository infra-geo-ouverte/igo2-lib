import { Injectable } from '@angular/core';

import { LegendRenderer } from 'geostyler-legend';
import { OlStyleParser as OpenLayersParser } from 'geostyler-openlayers-parser';
import {
  Style as GsStyle,
  IconSymbolizer,
  WriteStyleResult
} from 'geostyler-style';

import { AnyOlStyle, AnyStyle } from '../shared/layer/layer-style.interface';
import { isGeostylerLayerStyle } from '../shared/layer/layer-style.utils';
import { StyleService } from '../style-service/style.service';
import { GeostylerLegendType } from './geostyler.interface';

@Injectable()
export class GeostylerService extends StyleService {
  constructor() {
    super();
  }
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
  public getStyle(options: AnyStyle): Promise<AnyOlStyle> {
    const olParser = new OpenLayersParser();
    if (isGeostylerLayerStyle(options)) {
      return olParser.writeStyle(options.style).then((res) => {
        this.handleWarningsAndError(res);
        return res.output;
      });
    } else {
      super.getStyle(options);
    }
  }

  async getLegend(options: AnyStyle): Promise<string | undefined> {
    return isGeostylerLayerStyle(options)
      ? this.geostylerStylesToLegend([options.style])
      : super.getLegend(options);
  }

  private geostylerStylesToLegend(
    styles: GsStyle[],
    type: GeostylerLegendType = 'svg',
    width?: number,
    height?: number
  ): Promise<string> {
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
    return renderer.renderAsImage('svg').then((r) => {
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
    });
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
