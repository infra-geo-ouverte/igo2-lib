import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';

import { ConfigService } from '@igo2/core/config';
import { MessageService } from '@igo2/core/message';
import { StorageService } from '@igo2/core/storage';
import {
  DataSourceOptions,
  FeatureDataSource,
  NewEditionWorkspace
} from '@igo2/geo';

import { VectorLayer } from '../../layer/shared';
import { IgoMap } from '../../map/shared';
import { EditionWorkspaceFactoryService } from './edition-workspace-factory.service';
import { createTestIgoMap } from './tests.utils';

describe('EditionWorkspaceFactoryService', () => {
  let service: EditionWorkspaceFactoryService;
  let map: IgoMap;

  const dataSourceOptions: DataSourceOptions = {
    type: 'wfs',
    edition: {
      enabled: true,
      baseUrl: 'http://testing.com',
      addUrl: '/',
      modifyUrl: '/',
      deleteUrl: '/',
      geomType: 'Point',
      hasGeometry: true
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatDialogModule],
      providers: [
        {
          provide: StorageService,
          useValue: jasmine.createSpyObj(StorageService, ['get'])
        },
        {
          provide: ConfigService,
          useValue: jasmine.createSpyObj(ConfigService, ['getConfig'])
        },
        { provide: MessageService, useValue: {} }
      ]
    });
    map = createTestIgoMap();
    map.init();
    service = TestBed.inject(EditionWorkspaceFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a WFSEditionWorkspace', () => {
    const layer = new VectorLayer({
      source: new FeatureDataSource(dataSourceOptions)
    });
    map.addLayer(layer);
    const workspace = service.createWFSEditionWorkspace(layer, map);
    expect(workspace).toBeInstanceOf(NewEditionWorkspace);
  });
});
