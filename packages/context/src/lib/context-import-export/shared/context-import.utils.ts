import * as olStyle from 'ol/style';

import {
  FeatureDataSource,
  FeatureDataSourceOptions,
  IgoMap,
  VectorLayer,
  QueryableDataSourceOptions,
  StyleService,
  StyleListService,
  StyleByAttribute,
  ClusterParam,
  ClusterDataSourceOptions,
  ClusterDataSource
} from '@igo2/geo';
import { MessageService, LanguageService } from '@igo2/core';
import { DetailedContext } from '../../context-manager/shared/context.interface';
import { ContextService } from '../../context-manager/shared/context.service';
import OlFeature from 'ol/Feature';

export function handleFileImportSuccess(
  file: File,
  context: DetailedContext,
  messageService: MessageService,
  languageService: LanguageService,
  contextService: ContextService
) {
  if (Object.keys(context).length <= 0) {
    handleNothingToImportError(file, messageService, languageService);
    return;
  }

  const contextTitle = computeLayerTitleFromFile(file);

  addContextToContextList(context, contextTitle, contextService);

  const translate = languageService.translate;
  const messageTitle = translate.instant(
    'igo.context.contextImportExport.import.success.title'
  );
  const message = translate.instant(
    'igo.context.contextImportExport.import.success.text',
    {
      value: contextTitle
    }
  );
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
    'Failed to read file': handleUnreadbleFileImportError
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
  const title = translate.instant(
    'igo.context.contextImportExport.import.invalid.title'
  );
  const message = translate.instant(
    'igo.context.contextImportExport.import.invalid.text',
    {
      value: file.name,
      mimeType: file.type
    }
  );
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
  const title = translate.instant(
    'igo.context.contextImportExport.import.tooLarge.title'
  );
  const message = translate.instant(
    'igo.context.contextImportExport.import.tooLarge.text',
    {
      value: file.name,
      size: sizeMb
    }
  );
  messageService.error(message, title);
}

export function handleUnreadbleFileImportError(
  file: File,
  error: Error,
  messageService: MessageService,
  languageService: LanguageService
) {
  const translate = languageService.translate;
  const title = translate.instant(
    'igo.context.contextImportExport.import.unreadable.title'
  );
  const message = translate.instant(
    'igo.context.contextImportExport.import.unreadable.text',
    {
      value: file.name
    }
  );
  messageService.error(message, title);
}

export function handleNothingToImportError(
  file: File,
  messageService: MessageService,
  languageService: LanguageService
) {
  const translate = languageService.translate;
  const title = translate.instant(
    'igo.context.contextImportExport.import.empty.title'
  );
  const message = translate.instant(
    'igo.context.contextImportExport.import.empty.text',
    {
      value: file.name
    }
  );
  messageService.error(message, title);
}

export function addContextToContextList(
  context: DetailedContext,
  contextTitle: string,
  contextService: ContextService
) {
  context.title = contextTitle;
  context.imported = true;
  contextService.contexts$.value.ours.unshift(context);
  contextService.contexts$.next(contextService.contexts$.value);
  contextService.importedContext.unshift(context);
  contextService.loadContext(context.uri);
}

export function getFileExtension(file: File): string {
  return file.name.split('.').pop().toLowerCase();
}

export function computeLayerTitleFromFile(file: File): string {
  return file.name.substr(0, file.name.lastIndexOf('.'));
}

export function addImportedFeaturesToMap(
  olFeatures: OlFeature[],
  map: IgoMap,
  layerTitle: string
): VectorLayer {
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
    type: 'vector',
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

  return layer;
}

export function addImportedFeaturesStyledToMap(
  olFeatures: OlFeature[],
  map: IgoMap,
  layerTitle: string,
  styleListService: StyleListService,
  styleService: StyleService
): VectorLayer {
  let style;
  let distance: number;

  if (
    styleListService.getStyleList(layerTitle.toString() + '.styleByAttribute')
  ) {
    const styleByAttribute: StyleByAttribute = styleListService.getStyleList(
      layerTitle.toString() + '.styleByAttribute'
    );

    style = (feature) => {
      return styleService.createStyleByAttribute(feature, styleByAttribute);
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

    const baseStyle = styleService.createStyle(
      styleListService.getStyleList(layerTitle.toString() + '.clusterStyle')
    );

    style = (feature) => {
      return styleService.createClusterStyle(feature, clusterParam, baseStyle);
    };
  } else if (styleListService.getStyleList(layerTitle.toString() + '.style')) {
    style = styleService.createStyle(
      styleListService.getStyleList(layerTitle.toString() + '.style')
    );
  } else {
    style = styleService.createStyle(
      styleListService.getStyleList('default.style')
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
    source = new ClusterDataSource(sourceOptions);
    source.ol.source.addFeatures(olFeatures);
  } else {
    const sourceOptions: FeatureDataSourceOptions &
      QueryableDataSourceOptions = {
      type: 'vector',
      queryable: true
    };
    source = new FeatureDataSource(sourceOptions);
    source.ol.addFeatures(olFeatures);
  }

  const layer = new VectorLayer({
    title: layerTitle,
    source,
    style
  });
  map.addLayer(layer);

  return layer;
}
