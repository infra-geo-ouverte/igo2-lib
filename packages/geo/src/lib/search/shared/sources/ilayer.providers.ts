import { HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';

import { ILayerSearchResultFormatter, ILayerSearchSource } from './ilayer';
import { SearchSource } from './source';
import { SearchSourceFeature, SearchSourceKind } from './source.interfaces';

/**
 * ILayer search result formatter factory
 * @ignore
 */
export function ilayerSearchResultFormatterFactory(
  languageService: LanguageService
) {
  return new ILayerSearchResultFormatter(languageService);
}

/**
 * Function that returns a provider for the ILayer search result formatter
 */
export function provideILayerSearchResultFormatter() {
  return {
    provide: ILayerSearchResultFormatter,
    useFactory: ilayerSearchResultFormatterFactory,
    deps: [LanguageService]
  };
}

/**
 * ILayer search source factory
 * @ignore
 */
export function ilayerSearchSourceFactory(
  http: HttpClient,
  languageService: LanguageService,
  storageService: StorageService,
  config: ConfigService,
  formatter: ILayerSearchResultFormatter
) {
  return new ILayerSearchSource(
    http,
    languageService,
    storageService,
    config.getConfig(`searchSources.${ILayerSearchSource.id}`),
    formatter
  );
}

/**
 * Function that returns a provider for the ILayer search source
 */
export function provideILayerSearchSource() {
  return {
    provide: SearchSource,
    useFactory: ilayerSearchSourceFactory,
    multi: true,
    deps: [
      HttpClient,
      LanguageService,
      StorageService,
      ConfigService,
      ILayerSearchResultFormatter
    ]
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
