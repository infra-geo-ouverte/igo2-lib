import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from '@igo2/core/config';

import { DirectionsSource } from './directions-source';
import { OsrmDirectionsSourceOptions } from './directions-source.interface';
import { withOsrmSource } from './directions-source.provider';
import { OsrmDirectionsSource } from './osrm-directions-source';

describe('OsrmDirectionsSource (x-api-key)', () => {
  let httpMock: HttpTestingController;

  function setup(
    configOptions?: Partial<OsrmDirectionsSourceOptions>,
    providerOptions?: Partial<OsrmDirectionsSourceOptions>
  ): OsrmDirectionsSource {
    const configServiceSpy = {
      getConfig: vi.fn().mockReturnValue(configOptions)
    } as unknown as ConfigService;

    TestBed.configureTestingModule({
      providers: [
        { provide: ConfigService, useValue: configServiceSpy },
        ...withOsrmSource(providerOptions).providers
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    const sources = TestBed.inject(
      DirectionsSource
    ) as unknown as DirectionsSource[];
    return sources[0] as OsrmDirectionsSource;
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('should not set x-api-key header when apiKey is not configured', () => {
    const source = setup({
      id: 'osrmQc',
      baseUrl: 'https://osrm.example.com/route/v1/'
    });

    source
      .route([
        [-71.2, 46.8],
        [-71.3, 46.9]
      ])
      .subscribe();

    const req = httpMock.expectOne((r) =>
      r.url.startsWith('https://osrm.example.com/route/v1/driving/')
    );
    expect(req.request.headers.has('x-api-key')).toBe(false);
    req.flush({ routes: [], waypoints: [] });
  });

  it('should set x-api-key header when apiKey is configured via ConfigService', () => {
    const source = setup({
      id: 'osrmQc',
      baseUrl: 'https://osrm.example.com/route/v1/',
      apiKey: 'osrm-config-key'
    });

    source
      .route([
        [-71.2, 46.8],
        [-71.3, 46.9]
      ])
      .subscribe();

    const req = httpMock.expectOne((r) =>
      r.url.startsWith('https://osrm.example.com/route/v1/driving/')
    );
    expect(req.request.headers.get('x-api-key')).toBe('osrm-config-key');
    req.flush({ routes: [], waypoints: [] });
  });

  it('should set x-api-key header when apiKey is passed to withOsrmSource', () => {
    const source = setup(
      {
        id: 'osrmQc',
        baseUrl: 'https://osrm.example.com/route/v1/'
      },
      { apiKey: 'osrm-provider-key' }
    );

    source
      .route([
        [-71.2, 46.8],
        [-71.3, 46.9]
      ])
      .subscribe();

    const req = httpMock.expectOne((r) =>
      r.url.startsWith('https://osrm.example.com/route/v1/driving/')
    );
    expect(req.request.headers.get('x-api-key')).toBe('osrm-provider-key');
    req.flush({ routes: [], waypoints: [] });
  });
});
