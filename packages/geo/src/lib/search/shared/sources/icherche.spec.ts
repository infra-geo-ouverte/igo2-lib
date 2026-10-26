import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from '@igo2/core/config';
import { provideMockTranslation } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';

import { IChercheReverseSearchSource, IChercheSearchSource } from './icherche';
import {
  withIChercheReverseSource,
  withIChercheSource
} from './icherche.providers';
import { SearchSource } from './source';
import { SearchSourceOptions } from './source.interfaces';

describe('IChercheSearchSource & IChercheReverseSearchSource (x-api-key)', () => {
  let httpMock: HttpTestingController;

  const mockStorageService = {
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    remove: vi.fn()
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('IChercheSearchSource', () => {
    function setup(
      configOptions?: SearchSourceOptions,
      providerOptions?: SearchSourceOptions
    ): IChercheSearchSource {
      const configServiceSpy = {
        getConfig: vi.fn().mockReturnValue(configOptions)
      } as unknown as ConfigService;

      TestBed.configureTestingModule({
        providers: [
          { provide: ConfigService, useValue: configServiceSpy },
          { provide: StorageService, useValue: mockStorageService },
          provideMockTranslation(),
          ...withIChercheSource(providerOptions).providers
        ]
      });

      httpMock = TestBed.inject(HttpTestingController);
      const sources = TestBed.inject(SearchSource) as unknown as SearchSource[];
      return sources.find(
        (s) => s instanceof IChercheSearchSource
      ) as IChercheSearchSource;
    }

    it('should not set x-api-key header when apiKey is not configured', () => {
      const source = setup({
        searchUrl: 'https://icherche.securite.gouv.qc.ca'
      });

      const typesReq = httpMock.expectOne(
        'https://icherche.securite.gouv.qc.ca/types'
      );
      expect(typesReq.request.headers.has('x-api-key')).toBe(false);
      typesReq.flush(['adresses']);

      source.search('quebec-no-key').subscribe();
      const geocodeReq = httpMock.expectOne((r) =>
        r.url.startsWith('https://icherche.securite.gouv.qc.ca/geocode')
      );
      expect(geocodeReq.request.headers.has('x-api-key')).toBe(false);
      geocodeReq.flush({ features: [] });
    });

    it('should set x-api-key header when apiKey is configured via ConfigService', () => {
      const source = setup({
        searchUrl: 'https://icherche.securite.gouv.qc.ca',
        apiKey: 'abcdefg'
      });

      const typesReq = httpMock.expectOne(
        'https://icherche.securite.gouv.qc.ca/types'
      );
      expect(typesReq.request.headers.get('x-api-key')).toBe('abcdefg');
      typesReq.flush(['adresses']);

      source.search('quebec-with-config-key').subscribe();
      const geocodeReq = httpMock.expectOne((r) =>
        r.url.startsWith('https://icherche.securite.gouv.qc.ca/geocode')
      );
      expect(geocodeReq.request.headers.get('x-api-key')).toBe('abcdefg');
      geocodeReq.flush({ features: [] });
    });

    it('should set x-api-key header when apiKey is passed to withIChercheSource', () => {
      const source = setup(
        { searchUrl: 'https://icherche.securite.gouv.qc.ca' },
        { apiKey: 'provider-key-123' }
      );

      const typesReq = httpMock.expectOne(
        'https://icherche.securite.gouv.qc.ca/types'
      );
      expect(typesReq.request.headers.get('x-api-key')).toBe(
        'provider-key-123'
      );
      typesReq.flush(['adresses']);

      source.search('quebec-with-provider-key').subscribe();
      const geocodeReq = httpMock.expectOne((r) =>
        r.url.startsWith('https://icherche.securite.gouv.qc.ca/geocode')
      );
      expect(geocodeReq.request.headers.get('x-api-key')).toBe(
        'provider-key-123'
      );
      geocodeReq.flush({ features: [] });
    });
  });

  describe('IChercheReverseSearchSource', () => {
    function setup(
      configOptions?: SearchSourceOptions,
      providerOptions?: SearchSourceOptions
    ): IChercheReverseSearchSource {
      const configServiceSpy = {
        getConfig: vi.fn().mockReturnValue(configOptions)
      } as unknown as ConfigService;

      TestBed.configureTestingModule({
        providers: [
          { provide: ConfigService, useValue: configServiceSpy },
          { provide: StorageService, useValue: mockStorageService },
          provideMockTranslation(),
          ...withIChercheReverseSource(providerOptions).providers
        ]
      });

      httpMock = TestBed.inject(HttpTestingController);
      const sources = TestBed.inject(SearchSource) as unknown as SearchSource[];
      return sources.find(
        (s) => s instanceof IChercheReverseSearchSource
      ) as IChercheReverseSearchSource;
    }

    it('should set x-api-key header on reverse search and types requests when apiKey is configured', () => {
      const source = setup({
        searchUrl: 'https://terrapi.geo.securite.gouv.qc.ca',
        apiKey: 'terrapi-reverse-key'
      });

      const typesReq = httpMock.expectOne(
        'https://terrapi.geo.securite.gouv.qc.ca/types'
      );
      expect(typesReq.request.headers.get('x-api-key')).toBe(
        'terrapi-reverse-key'
      );
      typesReq.flush(['adresses']);

      source.reverseSearch([-71.2, 46.8]).subscribe();
      const locateReq = httpMock.expectOne((r) =>
        r.url.startsWith('https://terrapi.geo.securite.gouv.qc.ca/locate')
      );
      expect(locateReq.request.headers.get('x-api-key')).toBe(
        'terrapi-reverse-key'
      );
      locateReq.flush({ features: [] });
    });
  });
});
