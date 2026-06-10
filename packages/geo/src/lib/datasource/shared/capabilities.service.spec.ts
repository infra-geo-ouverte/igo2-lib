import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from '@igo2/core/config';

import { CapabilitiesService } from './capabilities.service';

describe('CapabilitiesService', () => {
  let service: CapabilitiesService;
  let httpMock: HttpTestingController;

  function setup(serverUrl?: string) {
    const configServiceSpy = {
      getConfig: vi.fn().mockReturnValue(serverUrl)
    } as unknown as ConfigService;

    TestBed.configureTestingModule({
      providers: [{ provide: ConfigService, useValue: configServiceSpy }]
    });

    service = TestBed.inject(CapabilitiesService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    setup();
    expect(service).toBeTruthy();
  });

  describe('getCapabilities — URL resolution', () => {
    it('should request an absolute URL unchanged when no serverUrl is configured', () => {
      setup(undefined);
      const url = 'https://geo.example.com/wms-abs-no-config';

      service.getCapabilities('wms', url).subscribe({ error: () => {} });

      const req = httpMock.expectOne((r) => r.url === url);
      expect(req.request.url).toBe(url);
      req.flush('');
    });

    it('should request an absolute URL unchanged when serverUrl is configured', () => {
      setup('https://server.example.com/igo2');
      const url = 'https://geo.example.com/wms-abs-with-config';

      service.getCapabilities('wms', url).subscribe({ error: () => {} });

      const req = httpMock.expectOne((r) => r.url === url);
      expect(req.request.url).toBe(url);
      req.flush('');
    });

    it('should keep a relative URL unchanged when no serverUrl is configured', () => {
      setup(undefined);
      const url = '/api/wms-rel-no-config';

      service.getCapabilities('wms', url).subscribe({ error: () => {} });

      const req = httpMock.expectOne((r) => r.url === url);
      expect(req.request.url).toBe(url);
      req.flush('');
    });

    it('should resolve a relative URL to absolute using the origin of serverUrl', () => {
      setup('https://server.example.com/igo2/app');
      const relativeUrl = '/api/wms-rel-with-config';
      const expectedUrl = 'https://server.example.com/api/wms-rel-with-config';

      service
        .getCapabilities('wms', relativeUrl)
        .subscribe({ error: () => {} });

      const req = httpMock.expectOne((r) => r.url === expectedUrl);
      expect(req.request.url).toBe(expectedUrl);
      req.flush('');
    });

    it('should use only the origin (no path) from serverUrl when resolving', () => {
      setup('https://server.example.com/some/deep/path?foo=bar');
      const relativeUrl = '/wms-rel-origin-only';
      const expectedUrl = 'https://server.example.com/wms-rel-origin-only';

      service
        .getCapabilities('wms', relativeUrl)
        .subscribe({ error: () => {} });

      const req = httpMock.expectOne((r) => r.url === expectedUrl);
      expect(req.request.url).toBe(expectedUrl);
      req.flush('');
    });

    it('should not modify a protocol-relative URL (starts with //)', () => {
      setup('https://server.example.com/igo2');
      const url = '//other.example.com/wms-proto-rel';

      service.getCapabilities('wms', url).subscribe({ error: () => {} });

      // The URL should not be prefixed with the server origin
      const req = httpMock.expectOne(
        (r) => !r.url.startsWith('https://server.example.com')
      );
      expect(req.request.url).not.toContain('server.example.com');
      req.flush('');
    });
  });
});
