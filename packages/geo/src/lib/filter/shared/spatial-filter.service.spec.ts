import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from '@igo2/core/config';
import { provideMockTranslation } from '@igo2/core/language';

import { Feature } from '../../feature/shared/feature.interfaces';
import {
  SpatialFilterItemType,
  SpatialFilterQueryType,
  SpatialFilterType
} from './spatial-filter.enum';
import {
  SPATIAL_FILTER_OPTIONS,
  SpatialFilterOptions
} from './spatial-filter.interface';
import { SpatialFilterService } from './spatial-filter.service';

describe('SpatialFilterService (x-api-key)', () => {
  let service: SpatialFilterService;
  let httpMock: HttpTestingController;

  function setup(
    configOptions?: SpatialFilterOptions,
    directOptions?: SpatialFilterOptions
  ) {
    const configServiceSpy = {
      getConfig: vi.fn().mockReturnValue(configOptions)
    } as unknown as ConfigService;

    TestBed.configureTestingModule({
      providers: [
        { provide: ConfigService, useValue: configServiceSpy },
        provideMockTranslation(),
        ...(directOptions
          ? [{ provide: SPATIAL_FILTER_OPTIONS, useValue: directOptions }]
          : [])
      ]
    });

    service = TestBed.inject(SpatialFilterService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('should not set x-api-key header when apiKey is not configured', () => {
    setup({ url: 'https://terrapi.geo.securite.gouv.qc.ca' });

    service.loadFilterList(SpatialFilterQueryType.AdmRegion).subscribe();

    const req = httpMock.expectOne(
      'https://terrapi.geo.securite.gouv.qc.ca/regadmin'
    );
    expect(req.request.headers.has('x-api-key')).toBe(false);
    req.flush({ features: [] });
  });

  it('should set x-api-key header on GET and POST requests when apiKey is configured', () => {
    setup({
      url: 'https://terrapi.geo.securite.gouv.qc.ca',
      apiKey: 'terrapi-key-123'
    });

    service.loadFilterList(SpatialFilterQueryType.AdmRegion).subscribe();
    const listReq = httpMock.expectOne(
      'https://terrapi.geo.securite.gouv.qc.ca/regadmin'
    );
    expect(listReq.request.headers.get('x-api-key')).toBe('terrapi-key-123');
    listReq.flush({ features: [] });

    service.loadThematicsList().subscribe();
    const typesReq = httpMock.expectOne(
      'https://terrapi.geo.securite.gouv.qc.ca/types'
    );
    expect(typesReq.request.headers.get('x-api-key')).toBe('terrapi-key-123');
    typesReq.flush([]);

    const mockFeature = {
      type: 'Feature',
      properties: { code: '01', nom: 'Test' },
      geometry: { type: 'Point', coordinates: [-71, 46] }
    } as unknown as Feature;

    service
      .loadFilterItems([mockFeature], SpatialFilterItemType.Address, {
        type: undefined as unknown as SpatialFilterQueryType,
        thematics: []
      })
      .subscribe();
    const locateReq = httpMock.expectOne(
      'https://terrapi.geo.securite.gouv.qc.ca/locate?type=adresses'
    );
    expect(locateReq.request.headers.get('x-api-key')).toBe('terrapi-key-123');
    locateReq.flush({ features: [] });

    service
      .loadBufferGeometry(mockFeature, SpatialFilterType.Polygon, 100)
      .subscribe();
    const bufferReq = httpMock.expectOne(
      'https://terrapi.geo.securite.gouv.qc.ca/geospatial/buffer?'
    );
    expect(bufferReq.request.headers.get('x-api-key')).toBe('terrapi-key-123');
    bufferReq.flush(mockFeature);
  });

  it('should allow overriding apiKey via SPATIAL_FILTER_OPTIONS', () => {
    setup(
      {
        url: 'https://terrapi.geo.securite.gouv.qc.ca',
        apiKey: 'config-key'
      },
      { apiKey: 'direct-key' }
    );

    service.loadThematicsList().subscribe();
    const req = httpMock.expectOne(
      'https://terrapi.geo.securite.gouv.qc.ca/types'
    );
    expect(req.request.headers.get('x-api-key')).toBe('direct-key');
    req.flush([]);
  });
});
