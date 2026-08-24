import { FeatureLike } from 'ol/Feature';
import { Extent } from 'ol/extent';
import { FeatureLoader, FeatureUrlFunction } from 'ol/featureloader';
import { ReadOptions } from 'ol/format/Feature';
import olProjection from 'ol/proj/Projection';
import olSourceVector from 'ol/source/Vector';

export interface VectorSourceLoadRequest {
  readonly source: olSourceVector;
  readonly url: string | FeatureUrlFunction;
  readonly extent: Extent;
  readonly resolution: number;
  readonly projection: olProjection;
  readonly readOptions: ReadOptions;
  readonly resolveUrls?: (url: string) => readonly string[];
  success(features: FeatureLike[]): void;
  failure(): void;
}

export interface VectorSourceLoaderHost {
  execute(request: VectorSourceLoadRequest): void;
}

export interface VectorSourceLoaderDataSource {
  createVectorSourceLoader(host: VectorSourceLoaderHost): FeatureLoader;
}

export function hasVectorSourceLoader(
  dataSource: unknown
): dataSource is VectorSourceLoaderDataSource {
  return (
    typeof dataSource === 'object' &&
    dataSource !== null &&
    'createVectorSourceLoader' in dataSource &&
    typeof dataSource.createVectorSourceLoader === 'function'
  );
}
