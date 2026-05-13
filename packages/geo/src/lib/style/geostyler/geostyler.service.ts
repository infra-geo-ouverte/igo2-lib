import { Injectable } from '@angular/core';

import { LegendRenderer } from 'geostyler-legend';
import { OlStyleParser as OpenLayersParser } from 'geostyler-openlayers-parser';
import {
  Style as GsStyle,
  IconSymbolizer,
  WriteStyleResult
} from 'geostyler-style';

import { StyleEngine } from '../shared/style-engine.interface';
import { StyleEngineKind } from '../shared/style.enum';
import { EngineLayerStyle } from '../shared/style.interface';
import { AnyOlStyle } from '../shared/style.types';
import { GeostylerLayerStyle } from './geostyler.interface';

@Injectable()
export class GeostylerService implements StyleEngine<GeostylerLayerStyle> {
  readonly type = StyleEngineKind.Geostyler;

  // Reuse the parser instance instead of creating one on every call
  private readonly olParser = new OpenLayersParser();

  supports(options: EngineLayerStyle): options is GeostylerLayerStyle {
    return options?.type === this.type;
  }

  async getStyle(options: GeostylerLayerStyle): Promise<AnyOlStyle> {
    const writeStyleResult = await this.olParser.writeStyle(options.style);
    this.handleWarningsAndErrors(writeStyleResult);
    return writeStyleResult?.output;
  }

  async getLegend(options: GeostylerLayerStyle): Promise<string | undefined> {
    const layerDescriptors = this.toLegendDescriptors(options.style);
    const computedHeight = this.computeLegendHeight(options.style);

    const renderer = new LegendRenderer({
      maxColumnWidth: 300,
      overflow: 'auto',
      styles: [layerDescriptors],
      size: [300, computedHeight],
      hideRect: true
    });
    const rendered = await renderer.renderAsImage('svg');
    const serializer = new XMLSerializer();
    const svgXmlString = serializer.serializeToString(rendered);
    return svgXmlString;
  }

  private toLegendDescriptors(style: GsStyle): GsStyle {
    return {
      name: style.name,
      rules: style.rules.map((rule) => ({
        name: rule.name,
        symbolizers: rule.symbolizers
          .filter((symb) => symb.kind !== 'Text')
          .map((symb) => {
            if (symb.kind !== 'Icon') return symb;

            const icon = symb as IconSymbolizer;
            return { ...icon, size: 15 } as IconSymbolizer;
          })
      }))
    };
  }

  private handleWarningsAndErrors(writeStyleResult: WriteStyleResult) {
    if (writeStyleResult?.warnings) {
      console.warn(writeStyleResult.warnings);
    }
    if (writeStyleResult?.errors) {
      throw writeStyleResult?.errors;
    }
    if (writeStyleResult?.unsupportedProperties) {
      console.warn(writeStyleResult.unsupportedProperties);
    }
  }

  private computeLegendHeight(style: GsStyle): number {
    const rowHeight = 26;
    const headerHeight = 22;
    const padding = 16;

    const nbRules = style.rules.length;
    const nbNames = style.name?.length ? 1 : 0;

    const raw = padding + nbNames * headerHeight + nbRules * rowHeight;

    return Math.max(100, Math.min(900, raw));
  }
}
