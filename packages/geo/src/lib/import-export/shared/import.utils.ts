import { ConfirmDialogService } from '@igo2/common/confirm-dialog';
import { MessageService } from '@igo2/core/message';
import { uuid } from '@igo2/utils';

import { first, of } from 'rxjs';

import { ClusterDataSource } from '../../datasource/shared/datasources/cluster-datasource';
import { ClusterDataSourceOptions } from '../../datasource/shared/datasources/cluster-datasource.interface';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { FeatureDataSourceOptions } from '../../datasource/shared/datasources/feature-datasource.interface';
import { Feature } from '../../feature/shared/feature.interfaces';
import {
  computeOlFeaturesExtent,
  featureToOl,
  moveToOlFeatures
} from '../../feature/shared/feature.utils';
import { ClusterParam } from '../../layer/shared/clusterParam';
import { LayerService } from '../../layer/shared/layer.service';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { IgoMap } from '../../map/shared/map';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import {
  featureRandomStyle,
  featureRandomStyleFunction
} from '../../style/shared/feature/feature-style';
import { StyleByAttribute } from '../../style/shared/vector/vector-style.interface';
import { StyleListService } from '../../style/style-list/style-list.service';
import { StyleService } from '../../style/style-service/style.service';

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
  let randomStyle;
  let editable = false;
  if (
    olFeatures[0].getKeys().includes('_style') ||
    olFeatures[0].getKeys().includes('_mapTitle')
  ) {
    randomStyle = featureRandomStyleFunction();
  } else {
    randomStyle = featureRandomStyle();
    editable = true;
  }
  const layer = layerService.createLayer({
    id,
    title: layerTitle,
    workspace: { enabled: true, searchIndexEnabled: true },
    isIgoInternalLayer: true,
    source,
    igoStyle: { editable },
    idbInfo: { storeToIdb, contextUri: contextUri },
    style: randomStyle
  }) as VectorLayer;
  layer.setExtent(computeOlFeaturesExtent(olFeatures, map.viewProjection));
  map.layerController.add(layer);
  moveToOlFeatures(map.viewController, olFeatures);

  return layer;
}

export function addLayerAndFeaturesStyledToMap(
  features: Feature[],
  map: IgoMap,
  layerTitle: string,
  styleListService: StyleListService,
  styleService: StyleService,
  layerId?: string,
  imposedSourceOptions?,
  imposedLayerOptions?,
  zoomTo = true
): VectorLayer {
  const olFeatures = features.map((feature: Feature) =>
    featureToOl(feature, map.projection)
  );
  let style;
  let distance: number;

  if (
    styleListService.getStyleList(layerTitle.toString() + '.styleByAttribute')
  ) {
    const styleByAttribute: StyleByAttribute = styleListService.getStyleList(
      layerTitle.toString() + '.styleByAttribute'
    );

    style = (feature, resolution) => {
      return styleService.createStyleByAttribute(
        feature,
        styleByAttribute,
        resolution
      );
    };
  } else if (
    styleListService.getStyleList(layerTitle.toString() + '.clusterStyle')
  ) {
    const clusterParam: ClusterParam = styleListService.getStyleList(
      layerTitle.toString() + '.clusterParam'
    );
    distance = styleListService.getStyleList(
      layerTitle.toString() + '.distance'
    );

    style = (feature, resolution) => {
      const baseStyle = styleService.createStyle(
        styleListService.getStyleList(layerTitle.toString() + '.clusterStyle'),
        feature,
        resolution
      );
      return styleService.createClusterStyle(
        feature,
        resolution,
        clusterParam,
        baseStyle
      );
    };
  } else if (styleListService.getStyleList(layerTitle.toString() + '.style')) {
    style = (feature, resolution) =>
      styleService.createStyle(
        styleListService.getStyleList(layerTitle.toString() + '.style'),
        feature,
        resolution
      );
  } else if (
    styleListService.getStyleList('default.clusterStyle') &&
    features[0].geometry.type === 'Point'
  ) {
    const clusterParam: ClusterParam = styleListService.getStyleList(
      'default.clusterParam'
    );
    distance = styleListService.getStyleList('default.distance');

    style = (feature, resolution) => {
      const baseStyle = styleService.createStyle(
        styleListService.getStyleList('default.clusterStyle'),
        feature,
        resolution
      );
      return styleService.createClusterStyle(
        feature,
        resolution,
        clusterParam,
        baseStyle
      );
    };
  } else {
    style = (feature, resolution) =>
      styleService.createStyle(
        styleListService.getStyleList('default.style'),
        feature,
        resolution
      );
  }

  let source;
  if (styleListService.getStyleList(layerTitle.toString() + '.clusterStyle')) {
    const sourceOptions: ClusterDataSourceOptions & QueryableDataSourceOptions =
      {
        distance,
        type: 'cluster',
        queryable: true
      };
    source = new ClusterDataSource(
      Object.assign(sourceOptions, imposedSourceOptions)
    );
    source.ol.source.addFeatures(olFeatures);
  } else if (styleListService.getStyleList(layerTitle.toString())) {
    const sourceOptions: FeatureDataSourceOptions & QueryableDataSourceOptions =
      {
        type: 'vector',
        queryable: true
      };
    source = new FeatureDataSource(
      Object.assign(sourceOptions, imposedSourceOptions)
    );
    source.ol.addFeatures(olFeatures);
  } else if (
    styleListService.getStyleList('default.clusterStyle') &&
    features[0].geometry.type === 'Point'
  ) {
    const sourceOptions: ClusterDataSourceOptions & QueryableDataSourceOptions =
      {
        distance,
        type: 'cluster',
        queryable: true
      };
    source = new ClusterDataSource(
      Object.assign(sourceOptions, imposedSourceOptions)
    );
    source.ol.source.addFeatures(olFeatures);
  } else {
    const sourceOptions: FeatureDataSourceOptions & QueryableDataSourceOptions =
      {
        type: 'vector',
        queryable: true
      };
    source = new FeatureDataSource(
      Object.assign(sourceOptions, imposedSourceOptions)
    );
    source.ol.addFeatures(olFeatures);
  }

  const layer = new VectorLayer(
    Object.assign(
      {
        title: layerTitle,
        id: layerId || uuid(),
        isIgoInternalLayer: true,
        source,
        style
      },
      imposedLayerOptions
    )
  );
  map.layerController.add(layer);
  if (zoomTo) {
    moveToOlFeatures(map.viewController, olFeatures);
  }
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
  confirmDialogService?: ConfirmDialogService,
  styleListService?: StyleListService,
  styleService?: StyleService
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
    if (!styleListService) {
      addLayerAndFeaturesToMap(
        features,
        map,
        contextUri,
        layerTitle,
        layerService,
        confirm
      );
    } else {
      addLayerAndFeaturesStyledToMap(
        features,
        map,
        layerTitle,
        styleListService,
        styleService
      );
    }

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
