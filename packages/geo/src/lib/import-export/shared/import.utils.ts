import * as olStyle from 'ol/style';
import OlFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { MessageService, LanguageService } from '@igo2/core';

import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { FeatureDataSourceOptions } from '../../datasource/shared/datasources/feature-datasource.interface';
import { Feature } from '../../feature/shared/feature.interfaces';
import {
  featureToOl,
  moveToOlFeatures
} from '../../feature/shared/feature.utils';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { IgoMap } from '../../map/shared/map';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import { StyleService } from '../../layer/shared/style.service';
import { StyleByAttribute } from '../../layer/shared/vector-style.interface';
import { StyleListService } from '../style-list/style-list.service';
import { ClusterParam } from '../../layer/shared/clusterParam';
import { ClusterDataSource } from '../../datasource/shared/datasources/cluster-datasource';
import { ClusterDataSourceOptions } from '../../datasource/shared/datasources/cluster-datasource.interface';
import { uuid } from '@igo2/utils';

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
  const layer = new VectorLayer({
    title: layerTitle,
    isIgoInternalLayer: true,
    source,
    style: createImportedLayerRandomStyle()
  });
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
  languageService: LanguageService,
  styleListService?: StyleListService,
  styleService?: StyleService
) {
  if (features.length === 0) {
    handleNothingToImportError(file, messageService, languageService);
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

  const translate = languageService.translate;
  const messageTitle = translate.instant('igo.geo.dropGeoFile.success.title');
  const message = translate.instant('igo.geo.dropGeoFile.success.text', {
    value: layerTitle
  });
  messageService.success(message, messageTitle);
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
function createImportedLayerRandomStyle(): (olFeature: OlFeature<OlGeometry>) => olStyle.Style {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  const stroke = new olStyle.Stroke({
    color: [r, g, b, 1],
    width: 2
  });
  const fill = new olStyle.Fill({
    color: [r, g, b, 0.4]
  });

  return (olFeature: OlFeature<OlGeometry>) => {
      const customStyle = olFeature.get('_style');
      if (customStyle) {
        const styleService = new StyleService();
        return styleService.createStyle(customStyle);
      }

      const style = new olStyle.Style({
        stroke,
        fill,
        image: new olStyle.Circle({
          radius: 5,
          stroke,
          fill
        }),
        text: olFeature.get('_mapTitle') ? new olStyle.Text({
          text: olFeature.get('_mapTitle').toString(),
          offsetX: 5,
          offsetY: -5,
          font: '12px Calibri,sans-serif',
          fill: new olStyle.Fill({ color: '#000' }),
          stroke: new olStyle.Stroke({ color: '#fff', width: 3 }),
          overflow: true
        }): undefined
      });
      return style;
  };
}

