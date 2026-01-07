import { MessageService } from '@igo2/core/message';
import {
  FeatureDataSource,
  FeatureDataSourceOptions,
  IgoMap,
  LayerRandomGsStyle,
  LayerRandomOlStyleFunction,
  QueryableDataSourceOptions,
  VectorLayer
} from '@igo2/geo';

import OlFeature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import type { default as OlGeometry, Type } from 'ol/geom/Geometry';

import {
  DetailedContext,
  ExtraFeatures
} from '../../context-manager/shared/context.interface';
import { ContextService } from '../../context-manager/shared/context.service';

export function handleFileImportSuccess(
  file: File,
  context: DetailedContext,
  messageService: MessageService,
  contextService: ContextService
) {
  if (Object.keys(context).length <= 0) {
    handleNothingToImportError(file, messageService);
    return;
  }

  const contextTitle = computeLayerTitleFromFile(file);

  addContextToContextList(context, contextTitle, contextService);

  messageService.success(
    'igo.context.contextImportExport.import.success.text',
    'igo.context.contextImportExport.import.success.title',
    undefined,
    {
      value: contextTitle
    }
  );
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
    'Failed to read file': handleUnreadbleFileImportError
  };
  errMapping[error.message](file, error, messageService, sizeMb);
}

export function handleInvalidFileImportError(
  file: File,
  error: Error,
  messageService: MessageService
) {
  messageService.error(
    'igo.context.contextImportExport.import.invalid.text',
    'igo.context.contextImportExport.import.invalid.title',
    undefined,
    {
      value: file.name,
      mimeType: file.type
    }
  );
}

export function handleSizeFileImportError(
  file: File,
  error: Error,
  messageService: MessageService,
  sizeMb: number
) {
  messageService.error(
    'igo.context.contextImportExport.import.tooLarge.text',
    'igo.context.contextImportExport.import.tooLarge.title',
    undefined,
    {
      value: file.name,
      size: sizeMb
    }
  );
}

export function handleUnreadbleFileImportError(
  file: File,
  error: Error,
  messageService: MessageService
) {
  messageService.error(
    'igo.context.contextImportExport.import.unreadable.text',
    'igo.context.contextImportExport.import.unreadable.title',
    undefined,
    {
      value: file.name
    }
  );
}

export function handleNothingToImportError(
  file: File,
  messageService: MessageService
) {
  messageService.error(
    'igo.context.contextImportExport.import.empty.text',
    'igo.context.contextImportExport.import.empty.title',
    undefined,
    { value: file.name }
  );
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
  extraFeatures: ExtraFeatures,
  map: IgoMap
): VectorLayer {
  const sourceOptions: FeatureDataSourceOptions & QueryableDataSourceOptions = {
    type: 'vector',
    queryable: true
  };

  const olFeatures = collectFeaturesFromExtraFeatures(extraFeatures);
  const source = new FeatureDataSource(sourceOptions);
  source.ol.addFeatures(olFeatures);
  const _mapTitle = olFeatures.every(
    (olFeature) => olFeature.getProperties()._mapTitle !== undefined
  )
    ? '_mapTitle'
    : undefined;

  const geometryTypes = new Set<Type>();
  olFeatures.forEach((olFeature) => {
    geometryTypes.add(olFeature.getGeometry().getType());
  });

  const layer = new VectorLayer({
    title: extraFeatures.name,
    isIgoInternalLayer: true,
    source,
    igoStyle: {
      editable: true,
      geostylerStyle: {
        global: LayerRandomGsStyle(_mapTitle, Array.from(geometryTypes))
      }
    },
    style: LayerRandomOlStyleFunction(),
    visible: extraFeatures.visible,
    opacity: extraFeatures.opacity
  });
  map.layerController.add(layer);

  return layer;
}

function collectFeaturesFromExtraFeatures(
  featureCollection: ExtraFeatures
): OlFeature<OlGeometry>[] {
  const format = new GeoJSON();
  const features = format.readFeatures(featureCollection, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  });
  return features;
}
