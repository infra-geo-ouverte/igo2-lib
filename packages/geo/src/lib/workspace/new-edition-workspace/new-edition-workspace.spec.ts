import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MessageService } from '@igo2/core/message';

import { DataSourceOptions, FeatureDataSource } from '../../datasource';
import { Feature, FeatureStore } from '../../feature';
import { GeoWorkspaceOptions, VectorLayer } from '../../layer/shared';
import { EditionWorkspaceTableTemplateFactory } from './edition-table-template-factory';
import { EditionFeature, NewEditionWorkspace } from './new-edition-workspace';
import { createTestIgoMap } from './tests.utils';

fdescribe('NewEditionWorkspace', () => {
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
      imports: [HttpClientTestingModule, MatDialogModule]
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
    // TODO
    // const req = createFeature();
    // req.flush({}, { status: 400, statusText: 'Bad Request' });
    // expect(workspace.isLoading).toBeFalsy();
    // expect(messageService.error).toHaveBeenCalledWith(
    //   'igo.geo.workspace.addError'
    // );
  });

  it('should not create a feature', () => {
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
        projection: 'EPSG:4326',
        geometry: {
          type,
          coordinates: [-69.84844106937622, 47.20478973016566]
        },
        properties: { id: '1234', name: 'toUpdate' }
      },
      {
        type: 'Feature',
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
});
