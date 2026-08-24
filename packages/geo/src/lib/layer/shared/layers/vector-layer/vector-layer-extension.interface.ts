import { InjectionToken } from '@angular/core';

import { FeatureLike } from 'ol/Feature';
import { Extent } from 'ol/extent';
import { FeatureUrlFunction } from 'ol/featureloader';
import olLayerVector from 'ol/layer/Vector';
import Projection from 'ol/proj/Projection';
import olSourceVector from 'ol/source/Vector';

import type {
  LayerExtension,
  LayerExtensionInstance
} from '../extension/layer-extension.interface';
import type { LayerId } from '../layer.interface';
import type { VectorLayerOptions } from './vector-layer.interface';

export interface VectorLayerExtensionStateSnapshot {
  readonly mapAttached: boolean;
  readonly visible: boolean;
}

export interface VectorLayerLoadRequest {
  readonly source: olSourceVector;
  readonly url: string | FeatureUrlFunction;
  readonly extent: Extent;
  readonly resolution: number;
  readonly projection: Projection;
  success(features: FeatureLike[]): void;
  failure(): void;
}

export type VectorLayerLoadHandler = (request: VectorLayerLoadRequest) => void;

export interface VectorLayerExtensionContext {
  readonly id: LayerId | undefined;
  readonly options: VectorLayerOptions;
  readonly layer: olLayerVector<olSourceVector>;
  readonly source: olSourceVector;
  requestRender(): void;
  getStateSnapshot(): VectorLayerExtensionStateSnapshot;
}

export interface VectorLayerExtensionInstance extends LayerExtensionInstance {
  interceptLoad?(
    request: VectorLayerLoadRequest,
    next: VectorLayerLoadHandler
  ): void;
}

export type VectorLayerExtension = LayerExtension<
  VectorLayerOptions,
  VectorLayerExtensionContext,
  VectorLayerExtensionInstance
>;

export const VECTOR_LAYER_EXTENSIONS = new InjectionToken<
  readonly VectorLayerExtension[]
>('VECTOR_LAYER_EXTENSIONS');
