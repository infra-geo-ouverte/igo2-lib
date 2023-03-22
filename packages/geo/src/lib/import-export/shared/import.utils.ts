import { MessageService, LanguageService } from '@igo2/core';

import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { FeatureDataSourceOptions } from '../../datasource/shared/datasources/feature-datasource.interface';
import { Feature } from '../../feature/shared/feature.interfaces';
import {
  featureToOl,
  moveToOlFeatures,
  computeOlFeaturesExtent
} from '../../feature/shared/feature.utils';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { IgoMap } from '../../map/shared/map';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import { StyleService } from '../../style/style-service/style.service';
import { StyleByAttribute } from '../../style/shared/vector/vector-style.interface';
import { StyleListService } from '../../style/style-list/style-list.service';
import { ClusterParam } from '../../layer/shared/clusterParam';
import { ClusterDataSource } from '../../datasource/shared/datasources/cluster-datasource';
import { ClusterDataSourceOptions } from '../../datasource/shared/datasources/cluster-datasource.interface';
import { uuid } from '@igo2/utils';
import { featureRandomStyle, featureRandomStyleFunction } from '../../style/shared/feature/feature-style';
import { LayerService } from '../../layer/shared/layer.service';
import { ConfirmDialogService } from '@igo2/common';

export function addLayerAndFeaturesToMap(
  features: Feature[],
  map: IgoMap,
  contextUri: string,
  layerTitle: string,
  layerService: LayerService,
  storeToIdb: boolean = false
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
  let editable: boolean = false;
  if (
    olFeatures[0].getKeys().includes('_style') ||
    olFeatures[0].getKeys().includes('_mapTitle')) {
    randomStyle = featureRandomStyleFunction();
  } else {
    randomStyle = featureRandomStyle();
    editable = true;
  }
  const layer = layerService.createLayer({
    id,
    title: layerTitle,
    isIgoInternalLayer: true,
    source,
    igoStyle: { editable },
    idbInfo: { firstLoad: true, storeToIdb, contextUri: contextUri || '*' },
    style: randomStyle
  }) as VectorLayer;
  layer.setExtent(computeOlFeaturesExtent(map, olFeatures));
  map.addLayer(layer);
  moveToOlFeatures(map, olFeatures);

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
  zoomTo: boolean = true

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
      return styleService.createStyleByAttribute(feature, styleByAttribute, resolution);
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
        styleListService.getStyleList(layerTitle.toString() + '.clusterStyle'), feature, resolution
      );
      return styleService.createClusterStyle(feature, resolution, clusterParam, baseStyle);
    };
  } else if (styleListService.getStyleList(layerTitle.toString() + '.style')) {
    style = (feature, resolution) => styleService.createStyle(
      styleListService.getStyleList(layerTitle.toString() + '.style'), feature, resolution
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
        styleListService.getStyleList('default.clusterStyle'), feature, resolution
      );
      return styleService.createClusterStyle(feature, resolution, clusterParam, baseStyle);
    };
  } else {
    style = (feature, resolution) => styleService.createStyle(
      styleListService.getStyleList('default.style'), feature, resolution
    );
  }

  let source;
  if (styleListService.getStyleList(layerTitle.toString() + '.clusterStyle')) {
    const sourceOptions: ClusterDataSourceOptions &
      QueryableDataSourceOptions = {
      distance,
      type: 'cluster',
      queryable: true
    };
    source = new ClusterDataSource(Object.assign(sourceOptions, imposedSourceOptions));
    source.ol.source.addFeatures(olFeatures);
  } else if (styleListService.getStyleList(layerTitle.toString())) {
    const sourceOptions: FeatureDataSourceOptions & QueryableDataSourceOptions = {
      type: 'vector',
      queryable: true
    };
    source = new FeatureDataSource(Object.assign(sourceOptions, imposedSourceOptions));
    source.ol.addFeatures(olFeatures);
  } else if (
    styleListService.getStyleList('default.clusterStyle') &&
    features[0].geometry.type === 'Point'
  ) {
    const sourceOptions: ClusterDataSourceOptions &
      QueryableDataSourceOptions = {
      distance,
      type: 'cluster',
      queryable: true
    };
    source = new ClusterDataSource(Object.assign(sourceOptions, imposedSourceOptions));
    source.ol.source.addFeatures(olFeatures);
  } else {
    const sourceOptions: FeatureDataSourceOptions & QueryableDataSourceOptions = {
      type: 'vector',
      queryable: true
    };
    source = new FeatureDataSource(Object.assign(sourceOptions, imposedSourceOptions));
    source.ol.addFeatures(olFeatures);
  }

  const layer = new VectorLayer(
    Object.assign({
      title: layerTitle,
      id: layerId || uuid(),
      isIgoInternalLayer: true,
      source,
      style
    }, imposedLayerOptions));
  map.addLayer(layer);
  if (zoomTo){
    moveToOlFeatures(map, olFeatures);
  }
  return layer;
}

export function handleFileImportSuccess(
  file: File,
  features: Feature[],
  map: IgoMap,
  contextUri: string,
  messageService: MessageService,
  languageService: LanguageService,
  layerService: LayerService,
  confirmDialogService: ConfirmDialogService,
  styleListService?: StyleListService,
  styleService?: StyleService
) {
  if (features.length === 0) {
    handleNothingToImportError(file, messageService, languageService);
    return;
  }

  const layerTitle = computeLayerTitleFromFile(file);

  confirmDialogService.open('igo.geo.import.promptStoreToIdb').subscribe((confirm) => {
    if (!styleListService) {
      addLayerAndFeaturesToMap(features, map, contextUri, layerTitle, layerService, confirm);
    } else {
      addLayerAndFeaturesStyledToMap(
        features,
        map,
        layerTitle,
        styleListService,
        styleService
      );
    }

  const translate = languageService.translate;
  const messageTitle = translate.instant('igo.geo.dropGeoFile.success.title');
  const message = translate.instant('igo.geo.dropGeoFile.success.text', {
    value: layerTitle
  });
  messageService.success(message, messageTitle);
  });
}

export function handleFileImportError(
  file: File,
  error: Error,
  messageService: MessageService,
  languageService: LanguageService,
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
  errMapping[error.message](
    file,
    error,
    messageService,
    languageService,
    sizeMb
  );
}

export function handleInvalidFileImportError(
  file: File,
  error: Error,
  messageService: MessageService,
  languageService: LanguageService
) {
  const translate = languageService.translate;
  const title = translate.instant('igo.geo.dropGeoFile.invalid.title');
  const message = translate.instant('igo.geo.dropGeoFile.invalid.text', {
    value: file.name,
    mimeType: file.type
  });
  messageService.error(message, title);
}

export function handleUnreadbleFileImportError(
  file: File,
  error: Error,
  messageService: MessageService,
  languageService: LanguageService
) {
  const translate = languageService.translate;
  const title = translate.instant('igo.geo.dropGeoFile.unreadable.title');
  const message = translate.instant('igo.geo.dropGeoFile.unreadable.text', {
    value: file.name
  });
  messageService.error(message, title);
}

export function handleSizeFileImportError(
  file: File,
  error: Error,
  messageService: MessageService,
  languageService: LanguageService,
  sizeMb: number
) {
  const translate = languageService.translate;
  const title = translate.instant('igo.geo.dropGeoFile.tooLarge.title');
  const message = translate.instant('igo.geo.dropGeoFile.tooLarge.text', {
    value: file.name,
    size: sizeMb
  });
  messageService.error(message, title);
}

export function handleNothingToImportError(
  file: File,
  messageService: MessageService,
  languageService: LanguageService
) {
  const translate = languageService.translate;
  const title = translate.instant('igo.geo.dropGeoFile.empty.title');
  const message = translate.instant('igo.geo.dropGeoFile.empty.text', {
    value: file.name,
    mimeType: file.type
  });
  messageService.error(message, title);
}

export function handleSRSImportError(
  file: File,
  messageService: MessageService,
  languageService: LanguageService
) {
  const translate = languageService.translate;
  const title = translate.instant('igo.geo.dropGeoFile.invalidSRS.title');
  const message = translate.instant('igo.geo.dropGeoFile.invalidSRS.text', {
    value: file.name,
    mimeType: file.type
  });
  messageService.error(message, title);
}

export function handleOgreServerImportError(
  file: File,
  error: Error,
  messageService: MessageService,
  languageService: LanguageService
) {
  const title = languageService.translate.instant('igo.geo.dropGeoFile.ogreServer.title');
  const message = languageService.translate.instant('igo.geo.dropGeoFile.ogreServer.text');
  messageService.error(message, title);
}

export function getFileExtension(file: File): string {
  return file.name
    .split('.')
    .pop()
    .toLowerCase();
}

export function computeLayerTitleFromFile(file: File): string {
  return file.name.substr(0, file.name.lastIndexOf('.'));
}
