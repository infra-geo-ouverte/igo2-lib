import { Injectable } from '@angular/core';

import { LegendRenderer } from 'geostyler-legend';
import { OlStyleParser as OpenLayersParser } from 'geostyler-openlayers-parser';
import {
  Style as GsStyle,
  IconSymbolizer,
  WriteStyleResult
} from 'geostyler-style';

import { StyleEngine } from '../shared/style-engine.interface';
import { AnyOlStyle, LayerStyle } from '../shared/style.types';
import {
  GeostylerLayerStyle,
  GeostylerLegendType
} from './geostyler.interface';

@Injectable()
export class GeostylerService implements StyleEngine<GeostylerLayerStyle> {
  readonly type = 'Geostyler' as const;

  // Reuse the parser instance instead of creating one on every call
  private readonly olParser = new OpenLayersParser();

  supports(options: LayerStyle): options is GeostylerLayerStyle {
    return options?.type === 'Geostyler';
  }

  async getStyle(options: GeostylerLayerStyle): Promise<AnyOlStyle> {
    const writeStyleResult = await this.olParser.writeStyle(options.style);
    this.handleWarningsAndError(writeStyleResult);
    return writeStyleResult.output;
  }

  async getLegend(options: GeostylerLayerStyle): Promise<string | undefined> {
    return this.geostylerStylesToLegend([options.style], 'svg');
  }

  private async geostylerStylesToLegend(
    styles: GsStyle[],
    type: GeostylerLegendType = 'svg',
    width?: number,
    height?: number
  ): Promise<string> {
    const layerDescriptors = this.toLegendDescriptors(styles);

    const computedHeight = height ?? this.computeLegendHeight(styles);

    const renderer = new LegendRenderer({
      maxColumnWidth: 300,
      overflow: 'auto',
      styles: layerDescriptors,
      size: [width ?? 300, height ?? computedHeight],
      hideRect: true
    });
    const rendered = await renderer.renderAsImage('svg');
    const serializer = new XMLSerializer();
    const svgXmlString = serializer.serializeToString(rendered);
    if (type === 'svg') return svgXmlString;
    const blob = new Blob([svgXmlString], { type: 'image/svg+xml' });
    return window.URL.createObjectURL(blob);
  }

  private toLegendDescriptors(styles: GsStyle[]): GsStyle[] {
    return styles.map((s) => ({
      name: s.name,
      rules: s.rules.map((rule) => ({
        name: rule.name,
        symbolizers: rule.symbolizers
          .filter((symb) => symb.kind !== 'Text')
          .map((symb) => {
            if (symb.kind !== 'Icon') return symb;

            const icon = symb as IconSymbolizer;
            return { ...icon, size: 15 } as IconSymbolizer;
          })
      }))
    }));
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

  private computeLegendHeight(styles: GsStyle[]): number {
    const rowHeight = 26;
    const headerHeight = 22;
    const padding = 16;

    const nbRules = styles.reduce((sum, s) => sum + s.rules.length, 0);
    const nbNames = styles.reduce(
      (sum, s) => sum + (s.name?.length ? 1 : 0),
      0
    );

    const raw = padding + nbNames * headerHeight + nbRules * rowHeight;

    return Math.max(100, Math.min(900, raw));
  }
}
