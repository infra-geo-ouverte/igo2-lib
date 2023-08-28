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
  featureRandomStyleFunction,
  VectorStyleLayer,
  FeatureWithDrawProperties,
  setCircleGeometry
} from '@igo2/geo';
import { MessageService } from '@igo2/core';
import { DetailedContext, ExtraFeatures } from '../../context-manager/shared/context.interface';
import { ContextService } from '../../context-manager/shared/context.service';
import OlFeature from 'ol/Feature';
import * as olStyle from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';

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
    'igo.context.contextImportExport.import.success.title', undefined, {
      value: contextTitle
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
    'Failed to read file': handleUnreadbleFileImportError
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
  messageService: MessageService,
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
    });
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
    });
}

export function handleNothingToImportError(
  file: File,
  messageService: MessageService
) {
  messageService.error(
    'igo.context.contextImportExport.import.empty.text',
    'igo.context.contextImportExport.import.empty.title',
    undefined,
    { value: file.name });
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
  const featureKeys = olFeatures[0]?.getKeys() ?? [];
  const editable: boolean = (featureKeys.includes('_style') || featureKeys.includes('_mapTitle')) ? true : false;
  const randomStyle = featureRandomStyleFunction();
  const layer = new VectorLayer({
    title: extraFeatures.name,
    isIgoInternalLayer: true,
    source,
    igoStyle: { editable },
    style: randomStyle,
    visible: extraFeatures.visible,
    opacity: extraFeatures.opacity
  });
  map.addLayer(layer);

  return layer;
}

export function addImportedFeaturesStyledToMap(
  extraFeatures: ExtraFeatures,
  map: IgoMap,
  styleListService: StyleListService,
  styleService: StyleService
): VectorLayer {
  let style: VectorStyleLayer;
  let distance: number;

  if (
    styleListService.getStyleList(extraFeatures.name + '.styleByAttribute')
  ) {
    const styleByAttribute: StyleByAttribute = styleListService.getStyleList(
      extraFeatures.name + '.styleByAttribute'
    );

    style = (feature, resolution) => {
      return styleService.createStyleByAttribute(feature, styleByAttribute, resolution);
    };
  } else if (
    styleListService.getStyleList(extraFeatures.name + '.clusterStyle')
  ) {
    const clusterParam: ClusterParam = styleListService.getStyleList(
      extraFeatures.name + '.clusterParam'
    );
    distance = styleListService.getStyleList(
      extraFeatures.name + '.distance'
    );

    style = (feature, resolution) => {
      const baseStyle = styleService.createStyle(
        styleListService.getStyleList(extraFeatures.name + '.clusterStyle'), feature, resolution
      );
      return styleService.createClusterStyle(feature, resolution, clusterParam, baseStyle);
    };
  } else if (styleListService.getStyleList(extraFeatures.name + '.style')) {
    style = (feature, resolution) => styleService.createStyle(
      styleListService.getStyleList(extraFeatures.name + '.style'), feature, resolution
    );
  } else {
    style = (feature, resolution) => styleService.createStyle(
      styleListService.getStyleList('default.style'), feature, resolution
    );
  }
  let source: ClusterDataSource | FeatureDataSource;
  if (styleListService.getStyleList(extraFeatures.name + '.clusterStyle')) {
    const sourceOptions: ClusterDataSourceOptions &
      QueryableDataSourceOptions = {
      distance,
      type: 'cluster',
      queryable: true
    };
    source = new ClusterDataSource(sourceOptions);
  } else {
    const sourceOptions: FeatureDataSourceOptions &
      QueryableDataSourceOptions = {
      type: 'vector',
      queryable: true
    };
    source = new FeatureDataSource(sourceOptions);
  }

  const olFeatures = collectFeaturesFromExtraFeatures(extraFeatures);
  const newFeatures = setCustomFeaturesStyle(olFeatures);
  source.ol.addFeatures(newFeatures);

  const layer = new VectorLayer({
    title: extraFeatures.name,
    isIgoInternalLayer: true,
    opacity: extraFeatures.opacity,
    visible: extraFeatures.visible,
    source,
    style
  });
  map.addLayer(layer);

  return layer;
}

function collectFeaturesFromExtraFeatures(featureCollection: ExtraFeatures): OlFeature<OlGeometry>[]{
  const format = new GeoJSON();
  const features = format.readFeatures(featureCollection, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  });
  return features;
}

function setCustomFeaturesStyle(olFeatures: OlFeature<OlGeometry>[]): OlFeature<OlGeometry>[] {
  let features: OlFeature<OlGeometry>[] = [];
  for (let index = 0; index < olFeatures.length; index++) {
    const feature: OlFeature<OlGeometry> = olFeatures[index];
    const featureProperties = feature.getProperties() as FeatureWithDrawProperties;
    const fill = new olStyle.Fill({ color: featureProperties.drawingStyle?.fill });
    const stroke = new olStyle.Stroke({ color: featureProperties.drawingStyle?.stroke });
    const text = new olStyle.Text({
      text: featureProperties?.draw,
      font: featureProperties?.fontStyle,
      offsetX: featureProperties?.offsetX,
      offsetY: featureProperties?.offsetY
    });

    feature.setStyle(
      new olStyle.Style({
          fill: fill,
          stroke: stroke,
          image: new olStyle.Circle({
            radius: 5,
            stroke: stroke,
            fill: fill,
          }),
          text: text
      })
    );
    // set feature Geometry if is circle
    if(feature.get('rad')) {
      setCircleGeometry(feature);
    }
    features.push(feature);
  }
  return features;
}


