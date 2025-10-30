import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import olLayerVector from 'ol/layer/Vector';

import { firstValueFrom } from 'rxjs';

import { mergeTestConfig } from '../../../../test-config';
import { GeostylerLayerStyle } from '../geostyler/geostyler.interface';
import { provideStyle } from '../style.provider';
import { StyleService } from '../style.service';
import { MapboxLayerStyle } from './mapbox.interface';
import { withMapbox } from './mapbox.provider';
import { MapboxService } from './mapbox.service';

const mapboxStyle: MapboxLayerStyle = {
  editable: false,
  type: 'Mapbox',
  style: {
    url: 'https://example.com/style.json',
    source: 'main'
  }
};

describe('MapboxService', () => {
  let service: MapboxService;
  let styleService: StyleService;
  let httpMock: HttpTestingController;
  let olLayer: olLayerVector;

  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        providers: [provideStyle(withMapbox())]
      })
    );

    service = TestBed.inject(MapboxService);
    styleService = TestBed.inject(StyleService);
    httpMock = TestBed.inject(HttpTestingController);
    olLayer = new olLayerVector({});
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('supports', () => {
    it('should support Mapbox styles', () => {
      expect(service.supports(mapboxStyle)).toBeTrue();
    });

    it('should reject non Mapbox styles', () => {
      const geostylerStyle: GeostylerLayerStyle = {
        editable: false,
        type: 'Geostyler',
        style: {
          name: 'Test Style',
          rules: []
        }
      };

      expect(service.supports(geostylerStyle)).toBeFalse();
    });
  });

  it('should register the mapbox engine in StyleService', async () => {
    const engineSpy = spyOn(service, 'getStyle').and.resolveTo(undefined);

    await styleService.getStyle(mapboxStyle, olLayer);

    expect(engineSpy).toHaveBeenCalledOnceWith(mapboxStyle, olLayer);
  });

  describe('getStyle', () => {
    it('should require an OpenLayers layer', async () => {
      await expectAsync(service.getStyle(mapboxStyle)).toBeRejectedWithError(
        'MapboxService.getStyle() requires an ol/layer/Vector or ol/layer/VectorTile instance (2nd argument).'
      );
    });

    it('should require a style url', async () => {
      await expectAsync(
        service.getStyle(
          {
            ...mapboxStyle,
            style: {
              ...mapboxStyle.style,
              url: ' '
            }
          },
          olLayer
        )
      ).toBeRejectedWithError(
        'MapboxService.getStyle(): options.style.url is required.'
      );
    });

    it('should require a style source', async () => {
      await expectAsync(
        service.getStyle(
          {
            ...mapboxStyle,
            style: {
              ...mapboxStyle.style,
              source: ' '
            }
          },
          olLayer
        )
      ).toBeRejectedWithError(
        'MapboxService.getStyle(): options.style.source is required.'
      );
    });

    it('should resolve the style without sprite metadata', async () => {
      const styleResponse = {};
      const styleOptions = {
        ...mapboxStyle,
        style: {
          ...mapboxStyle.style,
          url: 'https://example.com/style-without-sprite.json'
        }
      };
      const privateApi = service as unknown as {
        getResolvedStyle$: (
          url: string
        ) => ReturnType<(typeof service)['getResolvedStyle$']>;
      };

      const resultPromise = firstValueFrom(
        privateApi.getResolvedStyle$(styleOptions.style.url)
      );

      httpMock.expectOne(styleOptions.style.url).flush(styleResponse);

      const result = await resultPromise;

      expect(result).toEqual({ style: styleResponse });
    });

    it('should resolve sprite metadata when a sprite is available', async () => {
      const styleResponse = { sprite: './sprites/sprite-success' };
      const spriteJson = { icon: { x: 0, y: 0, width: 10, height: 10 } };
      const styleOptions = {
        ...mapboxStyle,
        style: {
          ...mapboxStyle.style,
          url: 'https://example.com/style-with-sprite.json'
        }
      };
      const privateApi = service as unknown as {
        getResolvedStyle$: (
          url: string
        ) => ReturnType<(typeof service)['getResolvedStyle$']>;
      };

      const resultPromise = firstValueFrom(
        privateApi.getResolvedStyle$(styleOptions.style.url)
      );

      httpMock.expectOne(styleOptions.style.url).flush(styleResponse);
      httpMock
        .expectOne('https://example.com/sprites/sprite-success.json')
        .flush(spriteJson);

      const result = await resultPromise;

      expect(result).toEqual({
        style: styleResponse,
        spriteBaseUrl: 'https://example.com/sprites/sprite-success',
        spriteJson
      });
    });

    it('should ignore sprite json failures and keep the resolved sprite base url', async () => {
      const styleResponse = { sprite: './sprites/sprite-error' };
      const styleOptions = {
        ...mapboxStyle,
        style: {
          ...mapboxStyle.style,
          url: 'https://example.com/style-with-sprite-error.json'
        }
      };
      const privateApi = service as unknown as {
        getResolvedStyle$: (
          url: string
        ) => ReturnType<(typeof service)['getResolvedStyle$']>;
      };

      const resultPromise = firstValueFrom(
        privateApi.getResolvedStyle$(styleOptions.style.url)
      );

      httpMock.expectOne(styleOptions.style.url).flush(styleResponse);
      httpMock
        .expectOne('https://example.com/sprites/sprite-error.json')
        .flush('Not found', { status: 404, statusText: 'Not Found' });

      const result = await resultPromise;

      expect(result).toEqual({
        style: styleResponse,
        spriteBaseUrl: 'https://example.com/sprites/sprite-error'
      });
    });
  });

  describe('getLegend', () => {
    it('should return undefined', async () => {
      await expectAsync(service.getLegend(mapboxStyle)).toBeResolvedTo(
        undefined
      );
    });
  });

  describe('toAbsoluteUrl', () => {
    it('should resolve relative sprite urls against the style url', () => {
      const privateApi = service as unknown as {
        toAbsoluteUrl: (base: string, maybeRelative: unknown) => string;
      };

      const result = privateApi.toAbsoluteUrl(
        'https://example.com/styles/style.json',
        './sprites/main'
      );

      expect(result).toBe('https://example.com/styles/sprites/main');
    });

    it('should preserve protocol-relative sprite urls', () => {
      const privateApi = service as unknown as {
        toAbsoluteUrl: (base: string, maybeRelative: unknown) => string;
      };

      const result = privateApi.toAbsoluteUrl(
        'https://example.com/styles/style.json',
        '//cdn.example.com/sprite'
      );

      expect(result).toBe(
        window.location.protocol + '//cdn.example.com/sprite'
      );
    });
  });
});
