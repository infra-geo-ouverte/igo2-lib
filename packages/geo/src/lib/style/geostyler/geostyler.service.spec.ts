import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';

import {
  IconSymbolizer,
  TextSymbolizer,
  WriteStyleResult
} from 'geostyler-style';
import { vi } from 'vitest';

import { MapboxLayerStyle } from '../mapbox/mapbox.interface';
import { provideStyle } from '../style.provider';
import { StyleService } from '../style.service';
import { GeostylerLayerStyle } from './geostyler.interface';
import { withGeostyler } from './geostyler.provider';
import { GeostylerService } from './geostyler.service';

const geostylerStyle: GeostylerLayerStyle = {
  editable: false,
  type: 'Geostyler',
  style: {
    name: 'Test Style',
    rules: [
      {
        name: 'Test Rule',
        symbolizers: [
          {
            kind: 'Fill',
            color: '#ff0000'
          }
        ]
      }
    ]
  }
};

describe('GeostylerService', () => {
  let service: GeostylerService;
  let styleService: StyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideStyle(withGeostyler())
      ]
    });
    service = TestBed.inject(GeostylerService);
    styleService = TestBed.inject(StyleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('supports', () => {
    it('should support Geostyler styles', () => {
      expect(service.supports(geostylerStyle)).toBe(true);
    });

    it('should reject non Geostyler styles', () => {
      const mapboxStyle: MapboxLayerStyle = {
        editable: false,
        type: 'Mapbox',
        style: {
          url: 'https://example.com/style.json',
          source: 'main'
        }
      };

      expect(service.supports(mapboxStyle)).toBe(false);
    });
  });

  it('should register the geostyler engine in StyleService', async () => {
    const result = await styleService.getStyle(geostylerStyle);

    expect(result).toBeTruthy();
  });

  describe('getLayerOlStyle', () => {
    it('should convert a GeoStyler style to OpenLayersstyle', async () => {
      const result = await service.getStyle(geostylerStyle);
      expect(result).toBeTruthy();
      expect(result).toBeDefined();
    });

    it('should forward the style to the OpenLayers parser and return its output', async () => {
      const expectedStyle = new Style({
        fill: new Fill({ color: '#ff0000' })
      });
      const parser = service['olParser'];
      const parserSpy = vi.spyOn(parser, 'writeStyle').mockResolvedValue({
        output: expectedStyle
      } as WriteStyleResult);

      const result = await service.getStyle(geostylerStyle);

      expect(parserSpy).toHaveBeenCalledTimes(1);
      expect(parserSpy).toHaveBeenCalledWith(geostylerStyle.style);
      expect(result).toBe(expectedStyle);
    });

    it('should log parser warnings, errors and unsupported properties', async () => {
      const parser = service['olParser'];
      const parserError = new Error('error');
      vi.spyOn(parser, 'writeStyle').mockResolvedValue({
        output: undefined,
        warnings: ['warning'],
        errors: [parserError],
        unsupportedProperties: ['unsupported']
      } as unknown as WriteStyleResult);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await service.getStyle(geostylerStyle);

      expect(warnSpy).toHaveBeenCalledWith(['warning']);
      expect(errorSpy).toHaveBeenCalledWith([parserError]);
      expect(warnSpy).toHaveBeenCalledWith(['unsupported']);
    });
  });

  describe('getLegendFromLayerStyle', () => {
    it('should generate a legend', async () => {
      const result = await service.getLegend({
        ...geostylerStyle,
        style: {
          name: 'Style 1',
          rules: [
            {
              name: 'Rule 1',
              symbolizers: [
                {
                  kind: 'Fill',
                  color: '#ff0000'
                }
              ]
            }
          ]
        }
      });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('svg');
    });

    it('should keep legend names, strip text symbolizers and normalize icon size', () => {
      const serviceWithPrivateApi = service as unknown as {
        toLegendDescriptors: (
          styles: GeostylerLayerStyle['style'][]
        ) => GeostylerLayerStyle['style'][];
      };
      const textSymbolizer: TextSymbolizer = {
        kind: 'Text',
        label: 'Hidden label',
        color: '#000000',
        font: ['Arial'],
        size: 12
      };
      const iconSymbolizer: IconSymbolizer = {
        kind: 'Icon',
        image: 'https://example.com/icon.svg',
        size: 48
      };

      const [result] = serviceWithPrivateApi.toLegendDescriptors([
        {
          name: 'Legend Style',
          rules: [
            {
              name: 'Legend Rule',
              symbolizers: [textSymbolizer, iconSymbolizer]
            }
          ]
        }
      ]);

      expect(result.name).toBe('Legend Style');
      expect(result.rules[0].name).toBe('Legend Rule');
      expect(result.rules[0].symbolizers.length).toBe(1);
      expect(result.rules[0].symbolizers[0]).toEqual({
        ...iconSymbolizer,
        size: 15
      });
    });
  });
  // cp
});
