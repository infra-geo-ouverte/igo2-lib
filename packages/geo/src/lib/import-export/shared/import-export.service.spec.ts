import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from '@igo2/core/config';

import OlFeature from 'ol/Feature';
import OlPoint from 'ol/geom/Point';

import { TableDataService } from '../../workspace/shared/table-data.service';
import { ExportService } from './export.service';
import { ImportExportServiceOptions } from './import.interface';
import { ImportService } from './import.service';

describe('ImportService & ExportService (x-api-key)', () => {
  let httpMock: HttpTestingController;

  function setup(importExportOptions: ImportExportServiceOptions) {
    const configServiceSpy = {
      getConfig: vi.fn((key: string) => {
        if (key === 'importExport') return importExportOptions;
        if (key === 'importExport.url') return importExportOptions.url;
        if (key === 'importExport.apiKey') return importExportOptions.apiKey;
        return undefined;
      })
    } as unknown as ConfigService;

    TestBed.configureTestingModule({
      providers: [
        { provide: ConfigService, useValue: configServiceSpy },
        { provide: TableDataService, useValue: {} }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('should not set x-api-key header on OGRE import/export when apiKey is not configured', () => {
    setup({ url: 'https://ogre.geo.securite.gouv.qc.ca' });
    const importService = TestBed.inject(ImportService);

    const zipFile = new File(['dummy'], 'test.zip', {
      type: 'application/zip'
    });
    importService.import(zipFile).subscribe({ error: () => {} });

    const req = httpMock.expectOne(
      'https://ogre.geo.securite.gouv.qc.ca/convert'
    );
    expect(req.request.headers.has('x-api-key')).toBe(false);
    req.flush({ type: 'FeatureCollection', features: [] });
  });

  it('should set x-api-key header on OGRE import when apiKey is configured', () => {
    setup({
      url: 'https://ogre.geo.securite.gouv.qc.ca',
      apiKey: 'ogre-key-456'
    });
    const importService = TestBed.inject(ImportService);

    const zipFile = new File(['dummy'], 'test.zip', {
      type: 'application/zip'
    });
    importService.import(zipFile).subscribe({ error: () => {} });

    const req = httpMock.expectOne(
      'https://ogre.geo.securite.gouv.qc.ca/convert'
    );
    expect(req.request.headers.get('x-api-key')).toBe('ogre-key-456');
    req.flush({ type: 'FeatureCollection', features: [] });
  });

  it('should set x-api-key header on OGRE export when apiKey is configured', () => {
    setup({
      url: 'https://ogre.geo.securite.gouv.qc.ca',
      apiKey: 'ogre-key-456'
    });
    const exportService = TestBed.inject(ExportService);

    const feature = new OlFeature({
      geometry: new OlPoint([-71.2, 46.8])
    });

    exportService
      .export(
        [feature],
        { format: 'Shapefile', layers: [], featureInMapExtent: false },
        'export-test'
      )
      .subscribe({ error: () => {} });

    const req = httpMock.expectOne((r) =>
      r.url.startsWith('https://ogre.geo.securite.gouv.qc.ca/convertJson')
    );
    expect(req.request.headers.get('x-api-key')).toBe('ogre-key-456');
    req.flush(new Blob(['']));
  });
});
