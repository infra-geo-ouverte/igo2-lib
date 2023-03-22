import type { default as OlGeometry } from 'ol/geom/Geometry';

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
  ClusterDataSource,
  featureRandomStyle,
  featureRandomStyleFunction
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
  olFeatures: OlFeature<OlGeometry>[],
  map: IgoMap,
  layerTitle: string
): VectorLayer {
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
  map.addLayer(layer);

  return layer;
}

export function addImportedFeaturesStyledToMap(
  olFeatures: OlFeature<OlGeometry>[],
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
    isIgoInternalLayer: true,
    source,
    style
  });
  map.addLayer(layer);

  return layer;
}
