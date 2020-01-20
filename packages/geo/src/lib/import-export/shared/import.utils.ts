import * as olStyle from 'ol/style';

import { MessageService, LanguageService, StyleListService, ConfigService } from '@igo2/core';

import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { FeatureDataSourceOptions } from '../../datasource/shared/datasources/feature-datasource.interface';
import { Feature } from '../../feature/shared/feature.interfaces';
import { featureToOl, moveToOlFeatures } from '../../feature/shared/feature.utils';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { IgoMap } from '../../map/shared/map';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import { StyleService } from '../../layer/shared/style.service';
import { StyleByAttribute } from '../../layer/shared/vector-style.interface';

export function addLayerAndFeaturesToMap(features: Feature[], map: IgoMap, layerTitle: string): VectorLayer {
  const olFeatures = features.map((feature: Feature) => featureToOl(feature, map.projection));

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
  const sourceOptions: FeatureDataSourceOptions & QueryableDataSourceOptions = {
    queryable: true
  };
  const source = new FeatureDataSource(sourceOptions);
  source.ol.addFeatures(olFeatures);
  const layer = new VectorLayer({
    title: layerTitle,
    source,
    style: new olStyle.Style({
      stroke,
      fill,
      image: new olStyle.Circle({
        radius: 5,
        stroke,
        fill
      })
    })
  });
  map.addLayer(layer);
  moveToOlFeatures(map, olFeatures);

  return layer;
}

export function addFeatureToLayer(features: Feature[], map: IgoMap, layerTitle: string,
                                  config: ConfigService, styleService: StyleService): VectorLayer {
  const olFeatures = features.map((feature: Feature) => featureToOl(feature, map.projection));
  let style;

  const radius = config.getConfig(layerTitle.toString() + '.style.radius');

  const stroke = new olStyle.Stroke({
    color: config.getConfig(layerTitle.toString() + '.style.stroke.color'),
    width: config.getConfig(layerTitle.toString() + '.style.stroke.width')
  });

  const fill = new olStyle.Fill({
    color: config.getConfig(layerTitle.toString() + '.style.fill.color')
  });
  if (config.getConfig(layerTitle.toString() + '.styleByAttribute')) {
    const styleByAttribute: StyleByAttribute = {
      type: config.getConfig(layerTitle.toString() + '.styleByAttribute.type'),
      attribute: config.getConfig(layerTitle.toString() + '.styleByAttribute.attribute'),
      data: config.getConfig(layerTitle.toString() + '.styleByAttribute.data'),
      fill: config.getConfig(layerTitle.toString() + '.styleByAttribute.fill'),
      stroke: config.getConfig(layerTitle.toString() + '.styleByAttribute.stroke'),
      width: config.getConfig(layerTitle.toString() + '.styleByAttribute.width'),
      radius: config.getConfig(layerTitle.toString() + '.styleByAttribute.radius'),
      icon: config.getConfig(layerTitle.toString() + '.styleByAttribute.icon'),
      scale: config.getConfig(layerTitle.toString() + '.styleByAttribute.scale'),
      label: config.getConfig(layerTitle.toString() + '.styleByAttribute.label'),
      baseStyle: config.getConfig(layerTitle.toString() + '.styleByAttribute.baseStyle')
    };

    console.log(styleByAttribute);
    const styleBy = feature => {
      return styleService.createStyleByAttribute(
        feature,
        styleByAttribute
      );
    };
    style = styleBy;

    const sourceOptions: FeatureDataSourceOptions & QueryableDataSourceOptions = {
      queryable: true
    };
    const source = new FeatureDataSource(sourceOptions);
    source.ol.addFeatures(olFeatures);

    const layer = new VectorLayer({
      title: layerTitle,
      source,
      style
    });
    console.log(layer);
    map.addLayer(layer);
    moveToOlFeatures(map, olFeatures);

    return layer;

  } else {
    const sourceOptions: FeatureDataSourceOptions & QueryableDataSourceOptions = {
      queryable: true
    };

    console.log('king of the jungle');
    const source = new FeatureDataSource(sourceOptions);
    source.ol.addFeatures(olFeatures);

    const layer = new VectorLayer({
      title: layerTitle,
      source,
      style: new olStyle.Style({
        stroke,
        fill,
        image: new olStyle.Circle({
          radius: radius ? radius : 5,
          stroke,
          fill
        })
      })
    });
    console.log(layer);
    map.addLayer(layer);
    moveToOlFeatures(map, olFeatures);

    const titre = config.getConfig('yo');
    console.log(titre);

    return layer;
  }
}

export function handleFileImportSuccess(
  file: File,
  features: Feature[],
  map: IgoMap,
  messageService: MessageService,
  languageService: LanguageService,
  config?: ConfigService,
  styleService?: StyleService,
  intoLayer?: boolean
) {
  if (features.length === 0) {
    handleNothingToImportError(file, messageService, languageService);
    return;
  }

  const layerTitle = computeLayerTitleFromFile(file);

  if (!intoLayer) {
    console.log('normal');
    addLayerAndFeaturesToMap(features, map, layerTitle);
  } else {
    console.log('ma modif');
    addFeatureToLayer(features, map, layerTitle, config, styleService);
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
  languageService: LanguageService
) {
  const errMapping = {
    'Invalid file': handleInvalidFileImportError,
    'File is too large': handleSizeFileImportError,
    'Failed to read file': handleUnreadbleFileImportError,
    'Invalid SRS definition': handleSRSImportError
  };
  errMapping[error.message](file, error, messageService, languageService);
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
  languageService: LanguageService
) {
  const translate = languageService.translate;
  const title = translate.instant('igo.geo.dropGeoFile.tooLarge.title');
  const message = translate.instant('igo.geo.dropGeoFile.tooLarge.text', {
      value: file.name
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

export function getFileExtension(file: File): string {
  return file.name.split('.').pop().toLowerCase();
}

export function computeLayerTitleFromFile(file: File): string {
  return file.name.substr(0, file.name.lastIndexOf('.'));
}
