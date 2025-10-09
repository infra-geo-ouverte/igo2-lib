import { ILayerSearchResultFormatter, ILayerSearchSource } from './ilayer';
import { SearchSource } from './source';
import { SearchSourceFeature, SearchSourceKind } from './source.interfaces';

/**
 * ILayer search result formatter factory
 * @ignore
 */
export function ilayerSearchResultFormatterFactory() {
  return new ILayerSearchResultFormatter();
}

/**
 * Function that returns a provider for the ILayer search result formatter
 */
export function provideILayerSearchResultFormatter() {
  return {
    provide: ILayerSearchResultFormatter,
    useFactory: ilayerSearchResultFormatterFactory
  };
}

/**
 * ILayer search source factory
 * @ignore
 */
export function ilayerSearchSourceFactory() {
  return new ILayerSearchSource();
}

/**
 * Function that returns a provider for the ILayer search source
 */
export function provideILayerSearchSource() {
  return {
    provide: SearchSource,
    useFactory: ilayerSearchSourceFactory,
    multi: true
  };
}

export function withILayerSource(): SearchSourceFeature<SearchSourceKind.ILayer> {
  return {
    kind: SearchSourceKind.ILayer,
    providers: [
      provideILayerSearchSource(),
      provideILayerSearchResultFormatter()
    ]
  };
}
