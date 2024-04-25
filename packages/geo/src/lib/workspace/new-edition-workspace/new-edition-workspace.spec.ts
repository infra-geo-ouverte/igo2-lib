import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MessageService } from '@igo2/core/message';

import { of } from 'rxjs';

import { DataSourceOptions, FeatureDataSource } from '../../datasource';
import { Feature, FeatureStore } from '../../feature';
import { GeoWorkspaceOptions, VectorLayer } from '../../layer/shared';
import { EditionWorkspaceTableTemplateFactory } from './edition-table-template-factory';
import { EditionFeature, NewEditionWorkspace } from './new-edition-workspace';
import { createTestIgoMap } from './tests.utils';

describe('NewEditionWorkspace', () => {
  let workspace: NewEditionWorkspace;

  const editionUrl = 'http://testing.com';

  let http: HttpClient;
  let httpTestingController: HttpTestingController;

  let dialog: MatDialog;
  let messageService: jasmine.SpyObj<MessageService>;
  const type = 'Point';

  const dsOptions: DataSourceOptions = {
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
    sourceFields: [
      {
        name: 'id',
        primary: true
      },
      {
        name: 'name'
      }
    ]
  };

  class ImplNewEditionWorkspace extends NewEditionWorkspace {
    getUpdateBody(feature: EditionFeature): Object {
      return feature.properties;
    }

    getCreateBody(feature: EditionFeature): Object {
      return feature.properties;
    }
  }

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

    workspace = new ImplNewEditionWorkspace(
      http,
      dialog,
      messageService,
      options
    );

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

  const createFeature = () => {
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
    return req;
  };

  it('should create a feature', () => {
    const req = createFeature();

    req.flush({});

    expect(workspace.isLoading).toBeFalsy();

    expect(messageService.success).toHaveBeenCalledWith(
      'igo.geo.workspace.addSuccess'
    );
  });

  it('should not create a feature when canceling', () => {
    const fieldsValues = { name: 'New Feature' };

    workspace.createFeature();

    expect(workspace.entityStore.count).toBe(1);

    const entities = workspace.entityStore.all();
    const newFeature = entities[0];

    newFeature.properties = {
      ...newFeature.properties,
      ...fieldsValues
    };
    workspace.cancelEdit(newFeature);

    expect(workspace.entityStore.count).toBe(0);
  });

  it('should not create a feature when server send bad request', () => {
    const req = createFeature();

    req.flush({}, { status: 400, statusText: 'Bad Request' });

    expect(workspace.isLoading).toBeFalsy();

    expect(messageService.error).toHaveBeenCalledWith(
      'igo.geo.workspace.addError'
    );
  });

  const updateFeature = () => {
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
    expect(req.request.body).toEqual(featureToEdit.properties);

    expect(workspace.isLoading).toBeTruthy();
    return req;
  };

  it('should update a feature', () => {
    const req = updateFeature();

    req.flush({});

    expect(workspace.isLoading).toBeFalsy();

    expect(messageService.success).toHaveBeenCalledWith(
      'igo.geo.workspace.modifySuccess'
    );
  });

  it('should not update a feature when server send bad request', () => {
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
    const featureBeforeEdit = JSON.parse(JSON.stringify(featureToEdit));
    workspace.updateFeature(featureToEdit);

    expect(workspace.entityStore.count).toBe(2);

    featureToEdit.properties = {
      ...featureToEdit.properties,
      ...fieldsValues
    };

    workspace.cancelEdit(featureToEdit);

    expect(workspace.entityStore.count).toBe(2);

    const canceledFeatureEdition = workspace.entityStore.all()[0];
    expect(canceledFeatureEdition).toEqual(featureBeforeEdit);
  });

  const deleteFeature = () => {
    const existingFeatures: Feature[] = [
      {
        type: 'Feature',
        meta: { id: '2345' },
        projection: 'EPSG:4326',
        geometry: {
          type,
          coordinates: [-69.84844106937622, 47.20478973016567]
        },
        properties: { id: '2345', name: 'notToDelete1' }
      },
      {
        type: 'Feature',
        meta: { id: '1234' },
        projection: 'EPSG:4326',
        geometry: {
          type,
          coordinates: [-69.84844106937622, 47.20478973016566]
        },
        properties: { id: '1234', name: 'toDelete' }
      },
      {
        type: 'Feature',
        meta: { id: '3456' },
        projection: 'EPSG:4326',
        geometry: {
          type,
          coordinates: [-69.84844106937622, 47.20478973016567]
        },
        properties: { id: '3456', name: 'notToDelete2' }
      }
    ];

    workspace.entityStore.insertMany(existingFeatures);

    const featureToDelete = existingFeatures[1];
    workspace.deleteFeature(featureToDelete);

    const req = httpTestingController.expectOne(
      editionUrl + dsOptions.edition.deleteUrl + featureToDelete.properties.id
    );

    expect(req.request.method).toBe('DELETE');

    expect(workspace.isLoading).toBeTruthy();

    return req;
  };

  it('should delete a feature', () => {
    const req = deleteFeature();
    req.flush({});

    expect(workspace.isLoading).toBeFalsy();

    expect(messageService.success).toHaveBeenCalledWith(
      'igo.geo.workspace.deleteSuccess'
    );
  });

  it('should handle error when deleting a feature', () => {
    const req = deleteFeature();
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(workspace.isLoading).toBeFalsy();

    expect(messageService.error).toHaveBeenCalledWith(
      'igo.geo.workspace.addError'
    );
  });
});
