import { TestBed } from '@angular/core/testing';

import olLayerVector from 'ol/layer/Vector';

import { mergeTestConfig } from '../../../test-config';
import { GeostylerLayerStyle } from './geostyler/geostyler.interface';
import { withGeostyler } from './geostyler/geostyler.provider';
import { GeostylerService } from './geostyler/geostyler.service';
import { MapboxLayerStyle } from './mapbox/mapbox.interface';
import { withMapbox } from './mapbox/mapbox.provider';
import { MapboxService } from './mapbox/mapbox.service';
import { provideStyle } from './style.provider';
import { StyleService } from './style.service';

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

const mapboxStyle: MapboxLayerStyle = {
  editable: false,
  type: 'Mapbox',
  style: {
    url: 'https://example.com/style.json',
    source: 'main'
  }
};

describe('StyleService', () => {
  describe('without style engine providers', () => {
    let service: StyleService;

    beforeEach(() => {
      TestBed.configureTestingModule(
        mergeTestConfig({
          providers: [StyleService]
        })
      );

      service = TestBed.inject(StyleService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should return the same OpenLayers style untouched', async () => {
      const olStyle = {
        'fill-color': '#ff0000'
      };

      const result = await service.getStyle(olStyle);

      expect(result).toBe(olStyle);
    });

    it('should fall back to a random OpenLayers flat style when no engine matches', async () => {
      spyOn(Math, 'random').and.returnValues(0.1, 0.2, 0.3);

      const result = await service.getStyle(geostylerStyle);

      expect(result).toEqual({
        'stroke-color': [25, 51, 76, 1],
        'stroke-width': 2,
        'fill-color': [25, 51, 76, 0.4],
        'circle-radius': 5,
        'circle-stroke-color': [25, 51, 76, 1],
        'circle-stroke-width': 2,
        'circle-fill-color': [25, 51, 76, 0.4],
        'text-value': ['case', ['has', '_mapTitle'], ['get', '_mapTitle'], ''],
        'text-offset-x': 5,
        'text-offset-y': -5,
        'text-font': '12px Calibri,sans-serif',
        'text-fill-color': '#000',
        'text-stroke-color': '#fff',
        'text-stroke-width': 3,
        'text-overflow': true
      });
    });

    it('should return undefined legend when no engine matches', async () => {
      await expectAsync(service.getLegend(geostylerStyle)).toBeResolvedTo(
        undefined
      );
    });
  });

  describe('withGeostyler', () => {
    let service: StyleService;
    let geostylerService: GeostylerService;

    beforeEach(() => {
      TestBed.configureTestingModule(
        mergeTestConfig({
          providers: [provideStyle(withGeostyler())]
        })
      );

      service = TestBed.inject(StyleService);
      geostylerService = TestBed.inject(GeostylerService);
    });

    it('should delegate Geostyler style conversion to GeostylerService', async () => {
      const expectedStyle = {
        'fill-color': '#ff0000'
      };
      const getStyleSpy = spyOn(geostylerService, 'getStyle').and.resolveTo(
        expectedStyle
      );

      const result = await service.getStyle(geostylerStyle);

      expect(getStyleSpy).toHaveBeenCalledTimes(1);
      expect(getStyleSpy.calls.mostRecent().args).toEqual([
        geostylerStyle,
        undefined
      ]);
      expect(result).toEqual(expectedStyle);
    });

    it('should delegate Geostyler legends to GeostylerService', async () => {
      const getLegendSpy = spyOn(geostylerService, 'getLegend').and.resolveTo(
        '<svg></svg>'
      );

      const result = await service.getLegend(geostylerStyle);

      expect(getLegendSpy).toHaveBeenCalledOnceWith(geostylerStyle);
      expect(result).toBe('<svg></svg>');
    });
  });

  describe('withMapbox', () => {
    let service: StyleService;
    let mapboxService: MapboxService;
    let olLayer: olLayerVector;

    beforeEach(() => {
      TestBed.configureTestingModule(
        mergeTestConfig({
          providers: [provideStyle(withMapbox())]
        })
      );

      service = TestBed.inject(StyleService);
      mapboxService = TestBed.inject(MapboxService);
      olLayer = new olLayerVector({});
    });

    it('should delegate Mapbox style conversion to MapboxService', async () => {
      const expectedStyle = {
        'fill-color': '#00ff00'
      };
      const getStyleSpy = spyOn(mapboxService, 'getStyle').and.resolveTo(
        expectedStyle
      );

      const result = await service.getStyle(mapboxStyle, olLayer);

      expect(getStyleSpy).toHaveBeenCalledOnceWith(mapboxStyle, olLayer);
      expect(result).toEqual(expectedStyle);
    });

    it('should delegate Mapbox legends to MapboxService', async () => {
      const getLegendSpy = spyOn(mapboxService, 'getLegend').and.resolveTo(
        undefined
      );

      const result = await service.getLegend(mapboxStyle);

      expect(getLegendSpy).toHaveBeenCalledOnceWith(mapboxStyle);
      expect(result).toBeUndefined();
    });
  });
});
