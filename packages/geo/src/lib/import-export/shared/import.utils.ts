import { ConfirmDialogService } from '@igo2/common/confirm-dialog';
import { MessageService } from '@igo2/core/message';
import { uuid } from '@igo2/utils';

import { first, of } from 'rxjs';

import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { FeatureDataSourceOptions } from '../../datasource/shared/datasources/feature-datasource.interface';
import { Feature } from '../../feature/shared/feature.interfaces';
import {
  computeOlFeaturesExtent,
  featureToOl,
  moveToOlFeatures
} from '../../feature/shared/feature.utils';
import { LayerService } from '../../layer/shared/layer.service';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { IgoMap } from '../../map/shared/map';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import { LayerRandomOlStyleFunction } from '../../style/shared/layer/layer-style.utils';

export function addLayerAndFeaturesToMap(
  features: Feature[],
  map: IgoMap,
  contextUri: string,
  layerTitle: string,
  layerService: LayerService,
  storeToIdb = false
): VectorLayer {
  const olFeatures = features.map((feature: Feature) =>
    featureToOl(feature, map.projection)
  );

  const id = uuid();
  const sourceOptions: FeatureDataSourceOptions & QueryableDataSourceOptions = {
    id,
    type: 'vector',
    queryable: true
  };
  const source = new FeatureDataSource(sourceOptions);
  source.ol.addFeatures(olFeatures);

  const layer = layerService.createLayer({
    id,
    title: layerTitle,
    workspace: { enabled: true, searchIndexEnabled: true },
    isIgoInternalLayer: true,
    source,
    style: LayerRandomOlStyleFunction(),
    idbInfo: { storeToIdb, contextUri: contextUri }
  }) as VectorLayer;
  layer.setExtent(computeOlFeaturesExtent(olFeatures, map.viewProjection));
  map.layerController.add(layer);
  moveToOlFeatures(map.viewController, olFeatures);

  return layer;
}

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

export function handleFileImportSuccess(
  file: File,
  features: Feature[],
  map: IgoMap,
  contextUri: string,
  messageService: MessageService,
  layerService: LayerService,
  confirmDialogService?: ConfirmDialogService
) {
  if (features.length === 0) {
    handleNothingToImportError(file, messageService);
    return;
  }

  let layerTitle = computeLayerTitleFromFile(file);

  const obs$ = confirmDialogService
    ? confirmDialogService.open('igo.geo.import.promptStoreToIdb')
    : of(false);

  obs$.pipe(first()).subscribe((confirm) => {
    const d = new Date();
    const dformat =
      [
        d.getFullYear(),
        padTo2Digits(d.getMonth() + 1),
        padTo2Digits(d.getDate())
      ].join('/') +
      ' ' +
      [padTo2Digits(d.getHours()), padTo2Digits(d.getMinutes())].join(':');

    layerTitle = confirm ? `${layerTitle} (${dformat})` : layerTitle;
    addLayerAndFeaturesToMap(
      features,
      map,
      contextUri,
      layerTitle,
      layerService,
      confirm
    );

    messageService.success(
      'igo.geo.dropGeoFile.success.text',
      'igo.geo.dropGeoFile.success.title',
      undefined,
      { value: layerTitle }
    );
  });
}

export function handleFileImportError(
  file: File,
  error: Error,
  messageService: MessageService,
  sizeMb?: number
) {
  sizeMb = sizeMb ? sizeMb : 30;
  const errMapping = {
    'Invalid file': handleInvalidFileImportError,
    'File is too large': handleSizeFileImportError,
    'Failed to read file': handleUnreadbleFileImportError,
    'Invalid SRS definition': handleSRSImportError,
    'Error 500 with OGRE': handleOgreServerImportError
  };
  errMapping[error.message](file, error, messageService, sizeMb);
}

export function handleInvalidFileImportError(
  file: File,
  error: Error,
  messageService: MessageService
) {
  messageService.error(
    'igo.geo.dropGeoFile.invalid.text',
    'igo.geo.dropGeoFile.invalid.title',
    undefined,
    {
      value: file.name,
      mimeType: file.type
    }
  );
}

export function handleUnreadbleFileImportError(
  file: File,
  error: Error,
  messageService: MessageService
) {
  messageService.error(
    'igo.geo.dropGeoFile.unreadable.text',
    'igo.geo.dropGeoFile.unreadable.title',
    undefined,
    { value: file.name }
  );
}

export function handleSizeFileImportError(
  file: File,
  error: Error,
  messageService: MessageService,
  sizeMb: number
) {
  messageService.error(
    'igo.geo.dropGeoFile.tooLarge.text',
    'igo.geo.dropGeoFile.tooLarge.title',
    undefined,
    {
      value: file.name,
      size: sizeMb
    }
  );
}

export function handleNothingToImportError(
  file: File,
  messageService: MessageService
) {
  messageService.error(
    'igo.geo.dropGeoFile.empty.text',
    'igo.geo.dropGeoFile.empty.title',
    undefined,
    {
      value: file.name,
      mimeType: file.type
    }
  );
}

export function handleSRSImportError(
  file: File,
  messageService: MessageService
) {
  messageService.error(
    'igo.geo.dropGeoFile.invalidSRS.text',
    'igo.geo.dropGeoFile.invalidSRS.title',
    undefined,
    {
      value: file.name,
      mimeType: file.type
    }
  );
}

export function handleOgreServerImportError(
  file: File,
  error: Error,
  messageService: MessageService
) {
  messageService.error(
    'igo.geo.dropGeoFile.ogreServer.text',
    'igo.geo.dropGeoFile.ogreServer.title'
  );
}

export function getFileExtension(file: File): string {
  return file.name.split('.').pop().toLowerCase();
}

export function computeLayerTitleFromFile(file: File): string {
  return file.name.substr(0, file.name.lastIndexOf('.'));
}
