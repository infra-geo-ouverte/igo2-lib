import { MessageService } from '@igo2/core';

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

export function addLayerAndFeaturesToMap(
  features: Feature[],
  map: IgoMap,
  layerTitle: string
): VectorLayer {
  const olFeatures = features.map((feature: Feature) =>
    featureToOl(feature, map.projection)
  );

  const sourceOptions: FeatureDataSourceOptions & QueryableDataSourceOptions = {
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
  const layer = new VectorLayer({
    title: layerTitle,
    isIgoInternalLayer: true,
    source,
    igoStyle: { editable },
    style: randomStyle
  });
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
  messageService: MessageService,
  styleListService?: StyleListService,
  styleService?: StyleService
) {
  if (features.length === 0) {
    handleNothingToImportError(file, messageService);
    return;
  }

  const layerTitle = computeLayerTitleFromFile(file);

  if (!styleListService) {
    addLayerAndFeaturesToMap(features, map, layerTitle);
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
    { value: layerTitle });
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
  errMapping[error.message](
    file,
    error,
    messageService,
    sizeMb
  );
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
    });
}

export function handleUnreadbleFileImportError(
  file: File,
  error: Error,
  messageService: MessageService
) {
  messageService.error('igo.geo.dropGeoFile.unreadable.text',
    'igo.geo.dropGeoFile.unreadable.title',
    undefined,
    { value: file.name });
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
    });
}

export function handleNothingToImportError(
  file: File,
  messageService: MessageService,
) {
  messageService.error(
    'igo.geo.dropGeoFile.empty.text',
    'igo.geo.dropGeoFile.empty.title',
    undefined,
    {
      value: file.name,
      mimeType: file.type
    });
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
    });
}

export function handleOgreServerImportError(
  file: File,
  error: Error,
  messageService: MessageService
) {
  messageService.error('igo.geo.dropGeoFile.ogreServer.text', 'igo.geo.dropGeoFile.ogreServer.title');
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
