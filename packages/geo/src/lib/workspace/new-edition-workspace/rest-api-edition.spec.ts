import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MessageService } from '@igo2/core/message';

import { of } from 'rxjs';

import { FeatureDataSource, FeatureDataSourceOptions } from '../../datasource';
import { Feature, FeatureStore } from '../../feature';
import { GeoWorkspaceOptions, VectorLayer } from '../../layer/shared';
import { EditionWorkspaceTableTemplateFactory } from './edition-table-template-factory';
import { RestAPIEdition } from './rest-api-edition';
import { createTestIgoMap } from './tests.utils';

describe('RestApiEdition', () => {
  let workspace: RestAPIEdition;

  const editionUrl = 'http://testing.com';

  let http: HttpClient;
  let httpTestingController: HttpTestingController;

  let dialog: MatDialog;
  let messageService: jasmine.SpyObj<MessageService>;
  const type = 'Point';

  const dsOptions: FeatureDataSourceOptions = {
    type: 'wfs',
    edition: {
      enabled: true,
      baseUrl: '/',
      addUrl: '/',
      modifyUrl: '/',
      deleteUrl: '/',
      geomType: type,
      hasGeometry: true
    },
    params: {
      fieldNameGeometry: 'geometry',
      maxFeatures: 10000,
      version: '1.0.0'
    },
    sourceFields: [
      {
        name: 'id',
        primary: true,
        validation: {
          readonly: true
        }
      },
      {
        name: 'name'
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatDialogModule],
      providers: [
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj(MatDialog, {
            open: { afterClosed: () => of(false) }
          })
        }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    dialog = TestBed.inject(MatDialog);
    messageService = jasmine.createSpyObj(MessageService, ['success', 'error']);

    const map = createTestIgoMap();
    const layer = new VectorLayer({
      source: new FeatureDataSource(dsOptions)
    });

    map.init();
    map.addLayer(layer);

    const entityStore = new FeatureStore([], { map });
    entityStore.bindLayer(layer);

    const templateFactory = new EditionWorkspaceTableTemplateFactory();

    const options = {
      id: '1',
      title: 'test-edition',
      map,
      layer,
      editionUrl,
      entityStore,
      meta: {
        tableTemplate: undefined
      }
    };

    workspace = new RestAPIEdition(http, dialog, messageService, options);

    templateFactory.addTemplateToWorkspace(workspace, layer);

    layer.options.workspace = Object.assign({}, layer.options.workspace, {
      srcId: layer.id,
      workspaceId: layer.id,
      enabled: true
    } as GeoWorkspaceOptions);

    layer.options.sourceOptions = dsOptions;
  });

  it('should create the workspace', () => {
    expect(workspace).toBeTruthy();
  });

  it('should create the feature with the correct body', () => {
    const fieldsValues = { name: 'New Feature' };

    workspace.createFeature();
    const entities = workspace.entityStore.all();
    const newFeature = entities[0];

    newFeature.properties = {
      ...newFeature.properties,
      ...fieldsValues
    };
    workspace.saveFeature(newFeature);

    const req = httpTestingController.expectOne(editionUrl + '/');
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(fieldsValues);
    expect(req.request.url).toEqual(editionUrl + dsOptions.edition.addUrl);

    expect(workspace.isLoading).toBeTruthy();

    req.flush({});

    expect(workspace.isLoading).toBeFalsy();

    expect(messageService.success).toHaveBeenCalledWith(
      'igo.geo.workspace.addSuccess'
    );
  });

  it('should update the feature with the correct body', () => {
    const fieldsValues = { name: 'updated' };
    const existingFeatures: Feature[] = [
      {
        type: 'Feature',
        meta: { id: '1' },
        projection: 'EPSG:4326',
        geometry: {
          type,
          coordinates: [-69.84844106937622, 47.20478973016566]
        },
        properties: { id: '1234', name: 'toUpdate' }
      },
      {
        type: 'Feature',
        meta: { id: '2' },
        projection: 'EPSG:4326',
        geometry: {
          type,
          coordinates: [-69.84844106937622, 47.20478973016567]
        },
        properties: { id: '2345', name: 'notToUpdate' }
      }
    ];

    workspace.entityStore.insertMany(existingFeatures);

    const featureToEdit = existingFeatures[0];
    workspace.updateFeature(featureToEdit);

    featureToEdit.properties = {
      ...featureToEdit.properties,
      ...fieldsValues
    };
    workspace.saveFeature(featureToEdit);

    const req = httpTestingController.expectOne(
      editionUrl + dsOptions.edition.modifyUrl + featureToEdit.properties.id
    );
    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(fieldsValues);

    expect(workspace.isLoading).toBeTruthy();

    req.flush({});

    expect(workspace.isLoading).toBeFalsy();

    expect(messageService.success).toHaveBeenCalledWith(
      'igo.geo.workspace.modifySuccess'
    );
  });
});
